import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  BookOpen, Code2, PenTool, Users, Clock, Target,
  Trophy, Brain, Calendar, CheckSquare, MessageSquare, TrendingUp,
  Award, Flame, Sparkles, ArrowRight, Play,
  BarChart3, Star, Zap, DoorOpen, GraduationCap, Sun, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { useAuth } from '../hooks/useAuth';
import { cn, formatDuration, timeAgo, getInitials, getRandomColor } from '../lib/utils';
import type { StudyRoom, StudySession, Task, LeaderboardEntry } from '../types';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const chartTooltip = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
  labelStyle: { color: 'hsl(var(--foreground))' },
};

const weeklyData = [
  { day: 'Mon', hours: 2.5, focus: 1.8, coding: 0.7 },
  { day: 'Tue', hours: 3.2, focus: 2.0, coding: 1.2 },
  { day: 'Wed', hours: 1.8, focus: 1.2, coding: 0.6 },
  { day: 'Thu', hours: 4.0, focus: 2.5, coding: 1.5 },
  { day: 'Fri', hours: 2.8, focus: 1.5, coding: 1.3 },
  { day: 'Sat', hours: 5.5, focus: 3.0, coding: 2.5 },
  { day: 'Sun', hours: 3.5, focus: 2.2, coding: 1.3 },
];

const subjectData = [
  { subject: 'Mathematics', hours: 32, color: '#8b5cf6' },
  { subject: 'Computer Science', hours: 45, color: '#3b82f6' },
  { subject: 'Physics', hours: 22, color: '#22c55e' },
  { subject: 'Languages', hours: 18, color: '#f59e0b' },
  { subject: 'Literature', hours: 12, color: '#ef4444' },
];

const quickActions = [
  { label: 'Create Study Room', icon: DoorOpen, href: '/study-rooms', color: 'from-violet-500 to-purple-600' },
  { label: 'Open Code Editor', icon: Code2, href: '/code-editor', color: 'from-blue-500 to-cyan-600' },
  { label: 'Start Whiteboard', icon: PenTool, href: '/whiteboard', color: 'from-emerald-500 to-teal-600' },
  { label: 'Schedule Session', icon: Calendar, href: '/calendar', color: 'from-orange-500 to-amber-600' },
  { label: 'Join Meeting', icon: Users, href: '/study-rooms', color: 'from-pink-500 to-rose-600' },
];

const mockRooms: (StudyRoom & { status: 'live' | 'scheduled' })[] = [
  {
    _id: '1', name: 'CS50 Study Group', description: 'Working through week 4 problems', subject: 'Computer Science',
    isPrivate: false, maxParticipants: 8, participants: [
      { user: { _id: 'u1', email: 'a@b.com', firstName: 'Alice', lastName: 'M.', role: 'student', studyStreak: 12, totalStudyHours: 120, completedTasks: 45, createdAt: '', updatedAt: '' }, joinedAt: '' },
      { user: { _id: 'u2', email: 'b@b.com', firstName: 'Bob', lastName: 'K.', role: 'student', studyStreak: 8, totalStudyHours: 90, completedTasks: 32, createdAt: '', updatedAt: '' }, joinedAt: '' },
      { user: { _id: 'u3', email: 'c@b.com', firstName: 'Carol', lastName: 'S.', role: 'student', studyStreak: 15, totalStudyHours: 150, completedTasks: 52, createdAt: '', updatedAt: '' }, joinedAt: '' },
    ], createdBy: { _id: 'u1', email: 'a@b.com', firstName: 'Alice', lastName: 'M.', role: 'student', studyStreak: 12, totalStudyHours: 120, completedTasks: 45, createdAt: '', updatedAt: '' },
    isActive: true, tags: ['cs50', 'algorithms'], createdAt: '', status: 'live',
  },
  {
    _id: '2', name: 'Calculus III Review', description: 'Preparing for final exam', subject: 'Mathematics',
    isPrivate: false, maxParticipants: 6, participants: [
      { user: { _id: 'u4', email: 'd@b.com', firstName: 'David', lastName: 'L.', role: 'student', studyStreak: 5, totalStudyHours: 60, completedTasks: 20, createdAt: '', updatedAt: '' }, joinedAt: '' },
      { user: { _id: 'u5', email: 'e@b.com', firstName: 'Eve', lastName: 'R.', role: 'student', studyStreak: 10, totalStudyHours: 110, completedTasks: 38, createdAt: '', updatedAt: '' }, joinedAt: '' },
    ], createdBy: { _id: 'u4', email: 'd@b.com', firstName: 'David', lastName: 'L.', role: 'student', studyStreak: 5, totalStudyHours: 60, completedTasks: 20, createdAt: '', updatedAt: '' },
    isActive: true, tags: ['calculus', 'exam-prep'], createdAt: '', status: 'live',
  },
  {
    _id: '3', name: 'Physics Lab Report', description: 'Collaborative lab write-up', subject: 'Physics',
    isPrivate: false, maxParticipants: 4, participants: [
      { user: { _id: 'u6', email: 'f@b.com', firstName: 'Frank', lastName: 'W.', role: 'student', studyStreak: 7, totalStudyHours: 75, completedTasks: 28, createdAt: '', updatedAt: '' }, joinedAt: '' },
    ], createdBy: { _id: 'u6', email: 'f@b.com', firstName: 'Frank', lastName: 'W.', role: 'student', studyStreak: 7, totalStudyHours: 75, completedTasks: 28, createdAt: '', updatedAt: '' },
    isActive: false, tags: ['physics', 'lab'], createdAt: '', status: 'scheduled',
  },
  {
    _id: '4', name: 'French Conversation', description: 'Practice speaking skills', subject: 'Languages',
    isPrivate: false, maxParticipants: 10, participants: [
      { user: { _id: 'u7', email: 'g@b.com', firstName: 'Grace', lastName: 'H.', role: 'student', studyStreak: 20, totalStudyHours: 200, completedTasks: 70, createdAt: '', updatedAt: '' }, joinedAt: '' },
      { user: { _id: 'u8', email: 'h@b.com', firstName: 'Henry', lastName: 'J.', role: 'student', studyStreak: 3, totalStudyHours: 35, completedTasks: 12, createdAt: '', updatedAt: '' }, joinedAt: '' },
      { user: { _id: 'u9', email: 'i@b.com', firstName: 'Ivy', lastName: 'K.', role: 'student', studyStreak: 9, totalStudyHours: 95, completedTasks: 33, createdAt: '', updatedAt: '' }, joinedAt: '' },
    ], createdBy: { _id: 'u7', email: 'g@b.com', firstName: 'Grace', lastName: 'H.', role: 'student', studyStreak: 20, totalStudyHours: 200, completedTasks: 70, createdAt: '', updatedAt: '' },
    isActive: true, tags: ['french', 'conversation'], createdAt: '', status: 'live',
  },
];

const upcomingSessions: (StudySession & { roomName: string })[] = [
  { _id: 's1', user: '', room: '1', startTime: new Date(Date.now() + 3600000).toISOString(), duration: 120, type: 'focus', subject: 'Computer Science', roomName: 'CS50 Study Group' },
  { _id: 's2', user: '', room: '2', startTime: new Date(Date.now() + 7200000).toISOString(), duration: 90, type: 'group', subject: 'Mathematics', roomName: 'Calculus III Review' },
  { _id: 's3', user: '', room: '3', startTime: new Date(Date.now() + 10800000).toISOString(), duration: 60, type: 'pomodoro', subject: 'Physics', roomName: 'Physics Lab Report' },
  { _id: 's4', user: '', room: '4', startTime: new Date(Date.now() + 14400000).toISOString(), duration: 45, type: 'coding', subject: 'Languages', roomName: 'French Conversation' },
];

const todayTasks: Task[] = [
  { _id: 't1', user: '', title: 'Complete CS50 problem set 4', priority: 'high', status: 'in_progress', dueDate: new Date(Date.now() + 7200000).toISOString(), category: 'Assignment', tags: ['cs50'], createdAt: '' },
  { _id: 't2', user: '', title: 'Review calculus derivatives chapter', priority: 'medium', status: 'todo', dueDate: new Date(Date.now() + 14400000).toISOString(), category: 'Study', tags: ['math'], createdAt: '' },
  { _id: 't3', user: '', title: 'Write physics lab conclusion', priority: 'low', status: 'todo', dueDate: new Date(Date.now() + 28800000).toISOString(), category: 'Lab', tags: ['physics'], createdAt: '' },
  { _id: 't4', user: '', title: 'Practice French vocabulary quiz', priority: 'medium', status: 'todo', dueDate: new Date(Date.now() + 43200000).toISOString(), category: 'Language', tags: ['french'], createdAt: '' },
];

const leaderboard: LeaderboardEntry[] = [
  { user: { _id: 'u7', email: 'g@b.com', firstName: 'Grace', lastName: 'H.', role: 'student', studyStreak: 20, totalStudyHours: 200, completedTasks: 70, createdAt: '', updatedAt: '' }, totalHours: 200, streak: 20, tasksCompleted: 70, resourcesShared: 15, score: 980 },
  { user: { _id: 'u3', email: 'c@b.com', firstName: 'Carol', lastName: 'S.', role: 'student', studyStreak: 15, totalStudyHours: 150, completedTasks: 52, createdAt: '', updatedAt: '' }, totalHours: 150, streak: 15, tasksCompleted: 52, resourcesShared: 12, score: 890 },
  { user: { _id: 'u10', email: 'j@b.com', firstName: 'Jack', lastName: 'D.', role: 'student', studyStreak: 18, totalStudyHours: 175, completedTasks: 60, createdAt: '', updatedAt: '' }, totalHours: 175, streak: 18, tasksCompleted: 60, resourcesShared: 20, score: 875 },
  { user: { _id: 'u1', email: 'a@b.com', firstName: 'Alice', lastName: 'M.', role: 'student', studyStreak: 12, totalStudyHours: 120, completedTasks: 45, createdAt: '', updatedAt: '' }, totalHours: 120, streak: 12, tasksCompleted: 45, resourcesShared: 8, score: 720 },
  { user: { _id: 'u11', email: 'k@b.com', firstName: 'Kate', lastName: 'P.', role: 'student', studyStreak: 14, totalStudyHours: 130, completedTasks: 48, createdAt: '', updatedAt: '' }, totalHours: 130, streak: 14, tasksCompleted: 48, resourcesShared: 10, score: 690 },
];

const activities = [
  { id: 'a1', type: 'join', description: 'Joined CS50 Study Group', time: new Date(Date.now() - 600000).toISOString(), icon: DoorOpen },
  { id: 'a2', type: 'task', description: 'Completed "Sorting Algorithms" task', time: new Date(Date.now() - 1800000).toISOString(), icon: CheckSquare },
  { id: 'a3', type: 'streak', description: 'Reached 5-day study streak', time: new Date(Date.now() - 3600000).toISOString(), icon: Flame },
  { id: 'a4', type: 'resource', description: 'Shared "Data Structures Cheat Sheet"', time: new Date(Date.now() - 7200000).toISOString(), icon: BookOpen },
  { id: 'a5', type: 'coding', description: 'Completed Python coding challenge', time: new Date(Date.now() - 14400000).toISOString(), icon: Code2 },
  { id: 'a6', type: 'achievement', description: 'Earned "Early Bird" badge', time: new Date(Date.now() - 28800000).toISOString(), icon: Award },
];

const todayDate = new Date();
const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

const statCards = [
  { label: 'Total Study Hours', value: '128.5', icon: Clock, trend: '+12%', up: true, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400' },
  { label: 'Active Rooms', value: '3', icon: DoorOpen, trend: '+2', up: true, color: 'from-violet-500/20 to-violet-600/10', iconColor: 'text-violet-400' },
  { label: 'Focus Time', value: '42.5', icon: Target, trend: '+8%', up: true, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400' },
  { label: 'Completed Tasks', value: '28', icon: CheckSquare, trend: '+5', up: true, color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-400' },
  { label: 'Coding Sessions', value: '15', icon: Code2, trend: '+3', up: true, color: 'from-cyan-500/20 to-cyan-600/10', iconColor: 'text-cyan-400' },
  { label: 'Resources Shared', value: '34', icon: BookOpen, trend: '+7', up: true, color: 'from-pink-500/20 to-pink-600/10', iconColor: 'text-pink-400' },
];

const aiRecommendations = [
  'Based on your progress, try tackling the "Graph Algorithms" module next — it aligns with your current CS50 curriculum.',
  'You\'ve been studying for 4 hours straight. Take a 15-minute break to maintain peak focus.',
  'Your Mathematics streak is impressive! Consider joining the Calculus III Review room for collaborative learning.',
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName || 'Student';
  const [chatInput, setChatInput] = useState('');
  const [taskChecked, setTaskChecked] = useState<Record<string, boolean>>({});

  const totalWeeklyHours = weeklyData.reduce((acc, d) => acc + d.hours, 0);
  const completedWeekly = 12;
  const weeklyGoal = 15;

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {todayDate.toLocaleDateString('en-US', dateOptions)}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-2">
            <Sun className="h-4 w-4 text-amber-400" />
            <span>Day {user?.studyStreak || 1} of your study streak</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Current Streak</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">
                  {user?.studyStreak || 1} Day Streak
                </p>
                <p className="text-muted-foreground max-w-lg">
                  You&apos;re on fire! Keep up the momentum. Every session brings you closer to your goals.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-card bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-xs font-bold text-white"
                    >
                      {['A', 'B', 'C'][i - 1]}
                    </div>
                  ))}
                </div>
                <Button className="gap-2 rounded-full">
                  <Play className="h-4 w-4 fill-current" />
                  Start Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="card-hover border-border bg-card overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  'p-2 rounded-lg bg-gradient-to-br',
                  stat.color,
                )}>
                  <stat.icon className={cn('h-4 w-4', stat.iconColor)} />
                </div>
                <span className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded-full',
                  stat.up ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10',
                )}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Weekly Progress
                </CardTitle>
                <CardDescription>{totalWeeklyHours.toFixed(1)} hours studied this week</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-emerald-400" />
                +{((weeklyData[weeklyData.length - 1].hours / weeklyData[0].hours - 1) * 100).toFixed(0)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fill="url(#hoursGrad)" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Subject Distribution
                </CardTitle>
                <CardDescription>Hours per subject this month</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="hours"
                  >
                    {subjectData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 w-full sm:w-auto shrink-0">
                {subjectData.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ background: sub.color }} />
                    <span className="text-foreground min-w-[100px]">{sub.subject}</span>
                    <span className="text-muted-foreground font-mono">{sub.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="group relative min-w-[180px] flex items-center gap-3 rounded-xl border border-border bg-card p-4 card-hover shrink-0"
            >
              <div className={cn(
                'p-2.5 rounded-lg bg-gradient-to-br',
                action.color,
                'shadow-lg',
              )}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{action.label}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Active Study Rooms</h2>
          <Link to="/study-rooms" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {mockRooms.map((room) => (
            <Card key={room._id} className="min-w-[280px] sm:min-w-[320px] border-border bg-card card-hover shrink-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {room.subject}
                  </Badge>
                  <div className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full',
                    room.status === 'live'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400',
                  )}>
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      room.status === 'live' ? 'bg-emerald-400' : 'bg-amber-400',
                    )} />
                    {room.status === 'live' ? 'Live' : 'Scheduled'}
                  </div>
                </div>
                <h3 className="font-semibold mb-1 truncate">{room.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{room.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 3).map((p, i) => (
                        <Avatar key={i} className="h-7 w-7 border-2 border-card">
                          <AvatarImage src={p.user.avatar} />
                          <AvatarFallback className={cn('text-[10px]', getRandomColor(p.user.firstName))}>
                            {getInitials(`${p.user.firstName} ${p.user.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {room.participants.length > 3 && (
                        <div className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                          +{room.participants.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{room.participants.length}/{room.maxParticipants}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {upcomingSessions.map((session) => (
              <div key={session._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                  session.type === 'focus' && 'bg-blue-500/10 text-blue-400',
                  session.type === 'group' && 'bg-violet-500/10 text-violet-400',
                  session.type === 'pomodoro' && 'bg-amber-500/10 text-amber-400',
                  session.type === 'coding' && 'bg-emerald-500/10 text-emerald-400',
                )}>
                  {session.type === 'focus' && <Target className="h-4 w-4" />}
                  {session.type === 'group' && <Users className="h-4 w-4" />}
                  {session.type === 'pomodoro' && <Clock className="h-4 w-4" />}
                  {session.type === 'coding' && <Code2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{session.roomName}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                      {session.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTime(session.startTime)} &middot; {formatDuration(session.duration)}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Today&apos;s Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {todayTasks.map((task) => {
              const checked = taskChecked[task._id] || false;
              return (
                <div
                  key={task._id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                    checked ? 'bg-muted/30' : 'hover:bg-muted/50',
                  )}
                  onClick={() => setTaskChecked((prev) => ({ ...prev, [task._id]: !prev[task._id] }))}
                >
                  <div className={cn(
                    'h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                    checked
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground/30 hover:border-primary/50',
                  )}>
                    {checked && <CheckSquare className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'text-sm transition-colors',
                      checked ? 'line-through text-muted-foreground' : '',
                    )}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due {formatTime(task.dueDate)}
                      </p>
                    )}
                  </div>
                  <div className={cn('h-2 w-2 rounded-full shrink-0', priorityColors[task.priority])} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Study Assistant
            </CardTitle>
            <CardDescription>Personalized recommendations for your study session</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border border-primary/10">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Study Insight</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiRecommendations[0]}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-xs h-9">
                <Sparkles className="h-3.5 w-3.5" />
                Generate Study Plan
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-xs h-9">
                <BookOpen className="h-3.5 w-3.5" />
                Summarize Notes
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-xs h-9">
                <PenTool className="h-3.5 w-3.5" />
                Practice Questions
              </Button>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <input
                type="text"
                placeholder="Ask your AI study assistant..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
              />
              <Button size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={!chatInput.trim()}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[320px] pr-3">
              <div className="space-y-0">
                {activities.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {idx < activities.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                      )}
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 border-card',
                        'bg-gradient-to-br from-primary/10 to-primary/5',
                      )}>
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(activity.time)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Leaderboard
              </CardTitle>
              <Badge variant="outline" className="text-xs">Top 5</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <div className="grid grid-cols-[32px_1fr_60px_60px_50px] gap-2 px-3 py-2 text-xs text-muted-foreground font-medium">
                <span>#</span>
                <span>User</span>
                <span className="text-right">Hours</span>
                <span className="text-right">Tasks</span>
                <span className="text-right">Score</span>
              </div>
              {leaderboard.map((entry, idx) => {
                const isCurrentUser = entry.user._id === user?._id;
                const trophyColor = idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : '';
                return (
                  <div
                    key={entry.user._id}
                    className={cn(
                      'grid grid-cols-[32px_1fr_60px_60px_50px] gap-2 items-center px-3 py-2.5 rounded-lg transition-colors',
                      isCurrentUser ? 'bg-primary/5 border border-primary/10' : 'hover:bg-muted/30',
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center text-sm font-semibold',
                      idx < 3 ? '' : 'text-muted-foreground',
                    )}>
                      {idx < 3 ? (
                        <Trophy className={cn('h-4 w-4', trophyColor)} />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={entry.user.avatar} />
                        <AvatarFallback className={cn('text-[10px]', getRandomColor(entry.user.firstName))}>
                          {getInitials(`${entry.user.firstName} ${entry.user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className={cn(
                          'text-sm truncate',
                          isCurrentUser && 'text-primary font-medium',
                        )}>
                          {entry.user.firstName} {entry.user.lastName[0]}.
                          {isCurrentUser && <span className="text-[10px] text-muted-foreground ml-1">(you)</span>}
                        </p>
                      </div>
                    </div>
                    <span className="text-right text-sm tabular-nums">{entry.totalHours}</span>
                    <span className="text-right text-sm tabular-nums">{entry.tasksCompleted}</span>
                    <span className="text-right text-sm font-semibold tabular-nums">{entry.score}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-tr-full pointer-events-none" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-5 relative">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/10">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Focus Streak: 5 days</p>
                <p className="text-xs text-muted-foreground">You&apos;re in the zone! Keep it going.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/10">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Tasks Completed This Week</p>
                <p className="text-xs text-muted-foreground">{completedWeekly}/{weeklyGoal} tasks done</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weekly Goal Progress</span>
                <span className="font-medium">{Math.round((completedWeekly / weeklyGoal) * 100)}%</span>
              </div>
              <Progress value={(completedWeekly / weeklyGoal) * 100} className="h-2.5" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>{weeklyGoal - completedWeekly} tasks remaining to hit your goal</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                Early Bird
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Flame className="h-3 w-3" />
                5-Day Streak
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Award className="h-3 w-3" />
                Top Performer
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <GraduationCap className="h-3 w-3" />
                Scholar
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
