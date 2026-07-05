import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../validators/auth.validator';

function parseRegister(data: Record<string, unknown>) {
  return registerSchema.parse({ body: data });
}

function parseLogin(data: Record<string, unknown>) {
  return loginSchema.parse({ body: data });
}

describe('Register Schema', () => {
  const validData = {
    email: 'user@example.com',
    password: 'strongPass1',
    firstName: 'John',
    lastName: 'Doe',
    department: 'Engineering',
    employeeId: 'EMP123',
  };

  it('should accept valid registration data', () => {
    const result = parseRegister(validData);
    expect(result.body.email).toBe('user@example.com');
    expect(result.body.password).toBe('strongPass1');
  });

  describe('email validation', () => {
    it('should reject missing email', () => {
      const rest = { ...validData };
      delete rest.email;
      expect(() => parseRegister(rest)).toThrow();
    });

    it('should reject empty email', () => {
      expect(() => parseRegister({ ...validData, email: '' })).toThrow();
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@domain.com',
        'user@.com',
        'user @domain.com',
      ];
      for (const email of invalidEmails) {
        expect(() => parseRegister({ ...validData, email })).toThrow();
      }
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name+tag@company.co.uk',
        'admin@sub.domain.io',
      ];
      for (const email of validEmails) {
        expect(() => parseRegister({ ...validData, email })).not.toThrow();
      }
    });
  });

  describe('password validation', () => {
    it('should reject missing password', () => {
      const rest = { ...validData };
      delete rest.password;
      expect(() => parseRegister(rest)).toThrow();
    });

    it('should reject short passwords', () => {
      const shortPasswords = ['', 'abc', '1234567'];
      for (const pw of shortPasswords) {
        expect(() => parseRegister({ ...validData, password: pw })).toThrow();
      }
    });

    it('should accept passwords with at least 8 characters', () => {
      expect(() => parseRegister({ ...validData, password: '12345678' })).not.toThrow();
    });

    it('should accept long passwords', () => {
      expect(() => parseRegister({ ...validData, password: 'a'.repeat(100) })).not.toThrow();
    });
  });

  describe('required fields validation', () => {
    it('should reject missing firstName', () => {
      const rest = { ...validData };
      delete rest.firstName;
      expect(() => parseRegister(rest)).toThrow();
    });

    it('should reject missing lastName', () => {
      const rest = { ...validData };
      delete rest.lastName;
      expect(() => parseRegister(rest)).toThrow();
    });

    it('should reject missing department', () => {
      const rest = { ...validData };
      delete rest.department;
      expect(() => parseRegister(rest)).toThrow();
    });

    it('should reject missing employeeId', () => {
      const rest = { ...validData };
      delete rest.employeeId;
      expect(() => parseRegister(rest)).toThrow();
    });

    it('should reject empty strings for required fields', () => {
      expect(() => parseRegister({ ...validData, firstName: '' })).toThrow();
      expect(() => parseRegister({ ...validData, lastName: '' })).toThrow();
      expect(() => parseRegister({ ...validData, department: '' })).toThrow();
      expect(() => parseRegister({ ...validData, employeeId: '' })).toThrow();
    });
  });
});

describe('Login Schema', () => {
  const validData = {
    email: 'user@example.com',
    password: 'myPassword123',
  };

  it('should accept valid login data', () => {
    const result = parseLogin(validData);
    expect(result.body.email).toBe('user@example.com');
    expect(result.body.password).toBe('myPassword123');
  });

  it('should require email', () => {
    const rest = { ...validData };
    delete rest.email;
    expect(() => parseLogin(rest)).toThrow();
  });

  it('should reject invalid email', () => {
    expect(() => parseLogin({ ...validData, email: 'not-valid' })).toThrow();
  });

  it('should require password', () => {
    const rest = { ...validData };
    delete rest.password;
    expect(() => parseLogin(rest)).toThrow();
  });

  it('should reject empty password', () => {
    expect(() => parseLogin({ ...validData, password: '' })).toThrow();
  });

  it('should accept extra fields (lenient parsing)', () => {
    const result = parseLogin({ ...validData, extraField: 'should be ignored' });
    expect(result.body.email).toBe('user@example.com');
  });
});
