import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  getInitials,
  getRandomColor,
  truncate,
  timeAgo,
} from '../lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6');
  });

  it('should handle undefined and null values', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });

  it('should return empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('should handle array inputs', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });
});

describe('formatDate', () => {
  it('should format a Date object', () => {
    const date = new Date(2025, 0, 15);
    expect(formatDate(date)).toBe('Jan 15, 2025');
  });

  it('should format an ISO string', () => {
    expect(formatDate('2025-06-01T12:00:00Z')).toBe('Jun 1, 2025');
  });

  it('should format a date string', () => {
    expect(formatDate('2025-12-25')).toBe('Dec 25, 2025');
  });
});

describe('formatTime', () => {
  it('should format time with hours and minutes', () => {
    const date = new Date(2025, 0, 1, 14, 30, 0);
    expect(formatTime(date)).toBe('02:30 PM');
  });

  it('should format midnight', () => {
    const date = new Date(2025, 0, 1, 0, 0, 0);
    expect(formatTime(date)).toBe('12:00 AM');
  });

  it('should format noon', () => {
    const date = new Date(2025, 0, 1, 12, 0, 0);
    expect(formatTime(date)).toBe('12:00 PM');
  });
});

describe('formatDateTime', () => {
  it('should combine date and time', () => {
    const result = formatDateTime('2025-03-15T09:00:00Z');
    expect(result).toContain('Mar 15, 2025');
    expect(result).toContain('at');
  });
});

describe('formatDuration', () => {
  it('should return minutes only when less than 60', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(1)).toBe('1m');
    expect(formatDuration(59)).toBe('59m');
  });

  it('should return hours only when exact hours', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(180)).toBe('3h');
  });

  it('should return hours and minutes for mixed durations', () => {
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(150)).toBe('2h 30m');
    expect(formatDuration(65)).toBe('1h 5m');
  });

  it('should handle large durations', () => {
    expect(formatDuration(1440)).toBe('24h');
    expect(formatDuration(1500)).toBe('25h');
    expect(formatDuration(1505)).toBe('25h 5m');
  });
});

describe('getInitials', () => {
  it('should extract initials from a two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should extract initials from a single-word name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should extract initials from a multi-word name', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('should uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('should return at most 2 characters', () => {
    expect(getInitials('Alice Bob Charlie Dave').length).toBeLessThanOrEqual(2);
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('getRandomColor', () => {
  it('should return a valid color class', () => {
    const color = getRandomColor('test');
    expect(color).toMatch(/^bg-\w+-\d+$/);
  });

  it('should return consistent colors for the same name', () => {
    expect(getRandomColor('Alice')).toBe(getRandomColor('Alice'));
  });

  it('should return different colors for different names', () => {
    const colors = new Set(Array.from({ length: 20 }, (_, i) => getRandomColor(`user${i}`)));
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe('truncate', () => {
  it('should return the string if shorter than max length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should return the string if equal to max length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('should truncate and add ellipsis if longer', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
    expect(truncate('hello world', 8)).toBe('hello wo...');
  });

  it('should handle empty string', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('should handle zero length', () => {
    expect(truncate('hello', 0)).toBe('...');
  });

  it('should handle very long strings', () => {
    const long = 'a'.repeat(1000);
    expect(truncate(long, 500)).toBe('a'.repeat(500) + '...');
    expect(truncate(long, 500).length).toBe(503);
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "just now" for current time', () => {
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('just now');
  });

  it('should return seconds ago', () => {
    expect(timeAgo(new Date('2025-06-15T11:59:55Z'))).toBe('5s ago');
  });

  it('should return minutes ago', () => {
    expect(timeAgo(new Date('2025-06-15T11:58:00Z'))).toBe('2m ago');
  });

  it('should return hours ago', () => {
    expect(timeAgo(new Date('2025-06-15T09:00:00Z'))).toBe('3h ago');
  });

  it('should return days ago', () => {
    expect(timeAgo(new Date('2025-06-13T12:00:00Z'))).toBe('2d ago');
  });

  it('should return weeks ago', () => {
    expect(timeAgo(new Date('2025-06-01T12:00:00Z'))).toBe('2w ago');
  });

  it('should return months ago', () => {
    expect(timeAgo(new Date('2025-04-15T12:00:00Z'))).toBe('2mo ago');
  });

  it('should return years ago', () => {
    expect(timeAgo(new Date('2023-06-15T12:00:00Z'))).toBe('2y ago');
  });

  it('should handle string date inputs', () => {
    expect(timeAgo('2025-06-15T11:59:50Z')).toBe('10s ago');
  });
});
