import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus,
  Clock, Video, MapPin, Users, BookOpen, Sparkles,
  List, Grid3X3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from '../components/ui/dialog';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '../components/ui/select';
import { cn, formatDate } from '../lib/utils';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'study' | 'meeting' | 'tutor' | 'exam' | 'workshop';
  room: string;
  participants: number;
}

function generateMockEvents(): CalendarEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const events: CalendarEvent[] = [];
  const types = ['study', 'meeting', 'tutor', 'exam', 'workshop'] as const;
  const rooms = ['Math Study Room', 'CS Lab', 'Physics Hall', 'Chem Lab', 'Languages Room', 'General Study'];

  for (let i = 0; i < 25; i++) {
    const day = 1 + Math.floor(Math.random() * 28);
    const hour = 8 + Math.floor(Math.random() * 10);
    const type = types[Math.floor(Math.random() * types.length)];
    const titles: Record<string, string[]> = {
      study: ['Calculus Review', 'DSA Practice', 'Physics Problem Set', 'Chemistry Lab Prep', 'Spanish Conversation'],
      meeting: ['Project Sync', 'Study Group Planning', 'Research Discussion', 'Peer Review Session'],
      tutor: ['Math Tutoring', 'CS Mentoring', 'Writing Workshop', 'Physics Help Session'],
      exam: ['Midterm Review', 'Final Exam Prep', 'Quiz Review', 'Practice Test'],
      workshop: ['Code Lab', 'Writing Workshop', 'Research Methods', 'Presentation Skills'],
    };
    const titleOptions = titles[type] || titles.study;
    const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
    events.push({
      id: `evt-${i}`,
      title,
      date: new Date(year, month, day).toISOString(),
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      type,
      room: rooms[Math.floor(Math.random() * rooms.length)],
      participants: 2 + Math.floor(Math.random() * 8),
    });
  }
  return events;
}

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear();
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const typeColors: Record<string, string> = {
  study: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  meeting: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  tutor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  exam: 'bg-red-500/15 text-red-500 border-red-500/30',
  workshop: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
};

const typeIcons: Record<string, React.ElementType> = {
  study: BookOpen,
  meeting: Users,
  tutor: Sparkles,
  exam: CalendarIcon,
  workshop: Users,
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [events] = useState<CalendarEvent[]>(generateMockEvents);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id' | 'participants'>>({ title: '', type: 'study', date: '', startTime: '', endTime: '', room: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const todayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(events, selectedDate);
  }, [events, selectedDate]);

  const monthEvents = useMemo(() => {
    const eventMap = new Map<number, number>();
    events.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        eventMap.set(day, (eventMap.get(day) || 0) + 1);
      }
    });
    return eventMap;
  }, [events, month, year]);

  const totalEvents = useMemo(() =>
    events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length, [events, month, year]);

  const totalHours = useMemo(() =>
    totalEvents * 1, [totalEvents]
  );

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [firstDay, daysInMonth]);

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage study sessions</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-blue-500">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
              <DialogDescription>Schedule a new study session or event</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title</label>
                <Input value={newEvent.title} onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Calculus Review" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={newEvent.date} onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newEvent.type} onValueChange={v => setNewEvent(prev => ({ ...prev, type: v as 'study' | 'meeting' | 'tutor' | 'exam' | 'workshop' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="time" value={newEvent.startTime} onChange={e => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input type="time" value={newEvent.endTime} onChange={e => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Room/ Location</label>
                <Input value={newEvent.room} onChange={e => setNewEvent(prev => ({ ...prev, room: e.target.value }))} placeholder="e.g., CS Lab 201" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button disabled={!newEvent.title}>Add Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="py-3 px-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold">{monthNames[month]} {year}</h2>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToToday}>Today</Button>
                  </div>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setViewMode('month')}
                    >
                      <Grid3X3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setViewMode('week')}
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-7 mb-1">
                  {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, i) => (
                    <div key={i} className="aspect-square p-0.5">
                      {day !== null ? (
                        <button
                          onClick={() => handleDayClick(day)}
                          className={cn(
                            'w-full h-full rounded-lg text-sm font-medium transition-all relative',
                            'hover:bg-muted/80',
                            isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                            isToday(day) && !isSelected(day) && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                          )}
                        >
                          <span className={cn(
                            'text-xs',
                            isSelected(day) && 'text-primary-foreground'
                          )}>{day}</span>
                          {monthEvents.has(day) && (
                            <div className="flex justify-center gap-0.5 mt-0.5">
                              {Array.from({ length: Math.min(monthEvents.get(day) || 0, 3) }).map((_, j) => (
                                <div key={j} className="h-1 w-1 rounded-full bg-primary" />
                              ))}
                            </div>
                          )}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-sm">
                  {selectedDate ? (
                    <>Events for <span className="font-semibold">{formatDate(selectedDate)}</span></>
                  ) : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {todayEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No events scheduled for this day</p>
                    <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-3.5 w-3.5" /> Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {todayEvents.map((event, i) => {
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex flex-col items-center min-w-[48px]">
                              <span className="text-sm font-bold">{event.startTime}</span>
                              <span className="text-[10px] text-muted-foreground">{event.endTime}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 capitalize', typeColors[event.type])}>
                                  {event.type}
                                </Badge>
                                <span className="text-sm font-medium truncate">{event.title}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {event.room}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" /> {event.participants}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 gap-1 opacity-0 group-hover:opacity-100 text-xs">
                              <Video className="h-3 w-3" /> Join
                            </Button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-sm">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                  <CalendarIcon className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-2xl font-bold text-blue-500">{totalEvents}</p>
                  <p className="text-[10px] text-muted-foreground">Events this month</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                  <Clock className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                  <p className="text-2xl font-bold text-emerald-500">{totalHours}h</p>
                  <p className="text-[10px] text-muted-foreground">Study hours scheduled</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 text-center">
                  <Users className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                  <p className="text-2xl font-bold text-purple-500">
                    {events.reduce((sum, e) => sum + e.participants, 0)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Total participants</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                  <Sparkles className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-2xl font-bold text-amber-500">
                    {events.filter(e => new Date(e.date) >= new Date()).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Upcoming events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-sm">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {events
                .filter(e => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn('p-1.5 rounded-md', typeColors[event.type].split(' ')[0])}>
                      {React.createElement(typeIcons[event.type] || BookOpen, { className: 'h-3.5 w-3.5' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(event.date)} · {event.startTime}
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
