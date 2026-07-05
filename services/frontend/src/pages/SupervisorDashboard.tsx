import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users, AlertTriangle, CheckCircle, Calendar, Clock, TrendingUp,
  UserCheck, Shield, Bell, ClipboardList, Eye,
} from 'lucide-react';
import { api } from '../services/api';
import type { Incident, LiveWorkerStatus } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getRiskBadge(level: string) {
  const map: Record<string, string> = {
    safe: 'text-green-400 border-green-500/30 bg-green-500/10',
    warning: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    high_risk: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  };
  return map[level] || 'text-muted-foreground border-border bg-muted/10';
}

function getRiskDot(level: string) {
  const map: Record<string, string> = {
    safe: 'bg-green-500', warning: 'bg-yellow-500',
    high_risk: 'bg-orange-500', critical: 'bg-red-500',
  };
  return map[level] || 'bg-muted-foreground';
}

function WorkerStatusCard({ worker }: { worker: LiveWorkerStatus }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-white`}>
          {worker.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{worker.name}</p>
          <p className="text-xs text-muted-foreground">{worker.designation} · {worker.department}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${getRiskDot(worker.riskLevel)}`} />
        <Badge className={`text-[10px] ${getRiskBadge(worker.riskLevel)}`}>
          {Math.round(worker.riskScore * 100)}%
        </Badge>
      </div>
    </div>
  );
}

function IncidentReviewCard({ incident }: { incident: Incident }) {
  const severityColor: Record<string, string> = {
    low: 'text-green-400', medium: 'text-yellow-400',
    high: 'text-orange-400', critical: 'text-red-400',
  };
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">{incident.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {incident.type.replace('_', ' ')} · {new Date(incident.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge className={`ml-2 text-[10px] ${severityColor[incident.severity]}`}>{incident.severity}</Badge>
      </div>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" className="h-7 border-border text-xs text-foreground hover:bg-accent">
          <Eye className="mr-1 h-3 w-3" />
          Review
        </Button>
        <Button size="sm" className="h-7 bg-green-600 text-xs text-white hover:bg-green-700">
          <CheckCircle className="mr-1 h-3 w-3" />
          Resolve
        </Button>
      </div>
    </div>
  );
}

export function SupervisorDashboard() {
  const [workers, setWorkers] = useState<LiveWorkerStatus[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [workerRes, incRes] = await Promise.all([
        api.getWorkerStatuses(),
        api.getIncidents({ limit: '20' }),
      ]);
      if (workerRes.data) setWorkers(workerRes.data);
      if (incRes.data) setIncidents(incRes.data.incidents);
    } catch (err) {
      console.error('Failed to load supervisor data', err);
    } finally {
      setLoading(false);
    }
  }

  const teamWorkers = workers.slice(0, 8);
  const pendingIncidents = incidents.filter(i => i.status === 'reported' || i.status === 'investigating').slice(0, 5);
  const todayAttendance = { present: 18, absent: 2, late: 1, leave: 3 };
  const totalTeam = todayAttendance.present + todayAttendance.absent + todayAttendance.late + todayAttendance.leave;

  const shiftSchedule = [
    { shift: 'Morning', time: '06:00 - 14:00', workers: 12, supervisor: 'John D.' },
    { shift: 'Afternoon', time: '14:00 - 22:00', workers: 8, supervisor: 'Sarah M.' },
    { shift: 'Night', time: '22:00 - 06:00', workers: 4, supervisor: 'Robert K.' },
  ];

  const safetyTrend = [
    { month: 'Jan', score: 88 }, { month: 'Feb', score: 85 },
    { month: 'Mar', score: 90 }, { month: 'Apr', score: 87 },
    { month: 'May', score: 92 }, { month: 'Jun', score: 91 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Supervisor Dashboard</h2>
            <p className="text-muted-foreground">Team oversight and incident management</p>
          </div>
          <Button>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-medium">Team Size</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{totalTeam}</p>
              <p className="mt-1 text-xs text-muted-foreground">Across all shifts</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-xs font-medium">Pending Reviews</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{pendingIncidents.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Incidents awaiting action</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserCheck className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium">Present Today</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{todayAttendance.present}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {todayAttendance.absent} absent · {todayAttendance.late} late
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-medium">Safety Score</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">91%</p>
              <p className="mt-1 text-xs text-green-400">↑ 3% from last month</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Users className="h-4 w-4 text-blue-400" />
                Team Worker Status
              </CardTitle>
              <CardDescription>Risk levels and online status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teamWorkers.map(w => <WorkerStatusCard key={w.workerId} worker={w} />)}
                {teamWorkers.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No workers in your team</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <ClipboardList className="h-4 w-4 text-yellow-400" />
                Pending Incidents
              </CardTitle>
              <CardDescription>Requiring your review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingIncidents.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No pending incidents</p>
                ) : (
                  pendingIncidents.map(inc => <IncidentReviewCard key={inc._id} incident={inc} />)
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Shield className="h-4 w-4 text-green-400" />
                Team Safety Score Trend
              </CardTitle>
              <CardDescription>Monthly average scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={safetyTrend}>
                  <defs>
                    <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis domain={[70, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#safeGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <UserCheck className="h-4 w-4 text-green-400" />
                Today&apos;s Attendance Summary
              </CardTitle>
              <CardDescription>Real-time team attendance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{todayAttendance.present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{todayAttendance.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{todayAttendance.late}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">{todayAttendance.leave}</p>
                  <p className="text-xs text-muted-foreground">On Leave</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Calendar className="h-4 w-4 text-purple-400" />
                Shift Schedule Overview
              </CardTitle>
               <CardDescription>Today&apos;s shift assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shiftSchedule.map((s) => (
                  <div key={s.shift} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                    <div>
                      <p className="text-sm font-medium text-white">{s.shift}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {s.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{s.workers} workers</p>
                      <p className="text-xs text-muted-foreground">Supervisor: {s.supervisor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
