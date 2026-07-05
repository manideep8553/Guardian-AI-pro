import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Shield, AlertTriangle, Calendar, BookOpen, TrendingUp,
  Award, Clock, FileText,
} from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const severityBadge: Record<string, string> = {
  low: 'text-green-400 border-green-500/30 bg-green-500/10',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
};

function SafetyGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'stroke-green-500' : pct >= 60 ? 'stroke-yellow-500' : pct >= 40 ? 'stroke-orange-500' : 'stroke-red-500';
  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r="52" fill="none"
          className={color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${pct * 3.267} 326.7`}
          initial={{ strokeDasharray: '0 326.7' }}
          animate={{ strokeDasharray: `${pct * 3.267} 326.7` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
      >
        <span className="text-3xl font-bold text-white">{pct}</span>
        <span className="text-xs text-muted-foreground">Score</span>
      </motion.div>
    </div>
  );
}

function CertificationBadge({ name, expiry, status }: { name: string; expiry: string; status: string }) {
  const statusColor = status === 'valid' ? 'text-green-400' : status === 'expiring' ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
      <div>
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-muted-foreground">Expires: {expiry}</p>
      </div>
      <Badge className={`text-[10px] ${statusColor} border-current`}>
        {status === 'valid' ? 'Valid' : status === 'expiring' ? 'Expiring' : 'Expired'}
      </Badge>
    </div>
  );
}

export function WorkerDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.getIncidents({ limit: '10' });
      setIncidents(res.data?.incidents || []);
    } catch (err) {
      console.error('Failed to load worker data', err);
    } finally {
      setLoading(false);
    }
  }

  const personalScore = 0.87;
  const personalAlerts = [
    { title: 'Near miss in Zone A4', severity: 'high', time: '2h ago' },
    { title: 'Fatigue level elevated', severity: 'medium', time: '4h ago' },
    { title: 'PPE compliance reminder', severity: 'low', time: '1d ago' },
  ];
  const certifications = [
    { name: 'Safety Equipment Operation', expiry: '2026-09-15', status: 'valid' },
    { name: 'Hazardous Material Handling', expiry: '2026-07-30', status: 'expiring' },
    { name: 'Emergency Response Training', expiry: '2026-06-01', status: 'valid' },
    { name: 'Advanced First Aid', expiry: '2026-05-01', status: 'expired' },
  ];
  const upcomingShifts = [
    { date: '2026-07-06', shift: 'Morning', time: '06:00 - 14:00', zone: 'Assembly Line 2' },
    { date: '2026-07-07', shift: 'Morning', time: '06:00 - 14:00', zone: 'Assembly Line 2' },
    { date: '2026-07-08', shift: 'Afternoon', time: '14:00 - 22:00', zone: 'Warehouse A' },
  ];
  const trainingModules = [
    { name: 'Fire Safety & Evacuation', progress: 100 },
    { name: 'Chemical Handling Safety', progress: 65 },
    { name: 'PPE Best Practices', progress: 40 },
    { name: 'Confined Space Entry', progress: 0 },
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">My Dashboard</h2>
          <p className="text-muted-foreground">Personal safety overview and activity</p>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-4">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Shield className="h-4 w-4 text-green-400" />
                My Safety Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <SafetyGauge score={personalScore} />
              <div className="mt-3 flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-green-400">↑ 5% this month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Personal Risk Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {personalAlerts.map((a, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-2.5">
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${severityBadge[a.severity]}`}>
                      <AlertTriangle className="h-3 w-3" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <FileText className="h-4 w-4 text-blue-400" />
                My Incident History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incidents.slice(0, 4).map((inc) => (
                  <div key={inc._id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{inc.title}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(inc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge className={`ml-2 text-[10px] ${severityBadge[inc.severity] || ''}`}>{inc.severity}</Badge>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">No incidents recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Calendar className="h-4 w-4 text-purple-400" />
                Upcoming Shifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingShifts.map((s, idx) => (
                  <div key={idx} className="rounded-lg border border-border bg-muted/20 p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-white">{s.date}</p>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">{s.shift}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {s.time} · {s.zone}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Award className="h-4 w-4 text-yellow-400" />
                Assigned Certifications
              </CardTitle>
              <CardDescription>Status of your safety certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <CertificationBadge key={cert.name} {...cert} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                Training Progress
              </CardTitle>
              <CardDescription>Your ongoing training modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingModules.map((mod) => (
                  <div key={mod.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">{mod.name}</span>
                      <span className="text-xs text-muted-foreground">{mod.progress}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${mod.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Continue Training
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
