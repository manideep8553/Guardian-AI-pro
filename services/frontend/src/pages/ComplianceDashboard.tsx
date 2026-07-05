import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Shield, CheckCircle, Clock, Calendar, Award, FileText,
  BookOpen, BarChart3,
} from 'lucide-react';

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const deptCompliance = [
  { name: 'Production', rate: 94, target: 95 },
  { name: 'Assembly', rate: 88, target: 90 },
  { name: 'Warehouse', rate: 76, target: 85 },
  { name: 'Lab', rate: 96, target: 95 },
  { name: 'Maintenance', rate: 82, target: 88 },
  { name: 'Logistics', rate: 79, target: 85 },
  { name: 'Admin', rate: 91, target: 90 },
];

const certifications = [
  { name: 'Safety Equipment Operation', worker: 'John Smith', expiry: '2026-08-15', status: 'valid' },
  { name: 'HazMat Handling', worker: 'Sarah Lee', expiry: '2026-07-25', status: 'expiring' },
  { name: 'Emergency Response', worker: 'Mike Brown', expiry: '2026-06-10', status: 'expired' },
  { name: 'First Aid Advanced', worker: 'Emma Wilson', expiry: '2026-09-01', status: 'valid' },
  { name: 'Fire Safety', worker: 'David Chen', expiry: '2026-07-05', status: 'expiring' },
  { name: 'Confined Space', worker: 'Lisa Park', expiry: '2026-05-20', status: 'expired' },
];

const trainingCompletion = [
  { name: 'Fire Safety & Evacuation', completed: 92, enrolled: 120 },
  { name: 'Chemical Handling', completed: 78, enrolled: 95 },
  { name: 'PPE Best Practices', completed: 110, enrolled: 120 },
  { name: 'Confined Space Entry', completed: 45, enrolled: 60 },
  { name: 'Emergency Response', completed: 88, enrolled: 100 },
];

const checklistItems = [
  { label: 'PPE compliance verified for all workers', done: true },
  { label: 'Fire extinguisher monthly inspection', done: true },
  { label: 'Chemical storage area audit', done: false },
  { label: 'Emergency exit routes updated', done: false },
  { label: 'First aid kits restocked', done: true },
  { label: 'Safety signage reviewed', done: false },
  { label: 'Ventilation system check', done: true },
  { label: 'Electrical safety inspection', done: false },
];

const audits = [
  { date: '2026-07-10', type: 'Internal Safety Audit', area: 'Assembly Line 1-4', auditor: 'OSHA Team' },
  { date: '2026-07-15', type: 'Compliance Review', area: 'Chemical Storage', auditor: 'EHS Dept' },
  { date: '2026-07-22', type: 'External Audit', area: 'All Facilities', auditor: 'Third Party' },
  { date: '2026-08-05', type: 'Follow-up Audit', area: 'Warehouse Operations', auditor: 'Internal' },
  { date: '2026-08-12', type: 'Process Safety Audit', area: 'Manufacturing', auditor: 'Process Team' },
];

function ComplianceGauge({ score }: { score: number }) {
  const pct = Math.round(score);
  const color = pct >= 90 ? 'stroke-green-500' : pct >= 80 ? 'stroke-yellow-500' : pct >= 70 ? 'stroke-orange-500' : 'stroke-red-500';
  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 120 120">
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
        <span className="text-4xl font-bold text-white">{pct}</span>
        <span className="text-xs text-muted-foreground">% Compliant</span>
      </motion.div>
    </div>
  );
}

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <div
        className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-colors ${
          done ? 'bg-green-500/20 text-green-400' : 'border border-muted-foreground/30'
        }`}
      >
        {done && <CheckCircle className="h-3.5 w-3.5" />}
      </div>
      <span className={`flex-1 text-sm ${done ? 'text-muted-foreground line-through' : 'text-white'}`}>{label}</span>
      {!done && <Badge className="text-[10px] text-yellow-400 border-yellow-500/30 bg-yellow-500/10">Open</Badge>}
    </div>
  );
}

export function ComplianceDashboard() {
  const [complianceScore] = useState(86);
  const [checklist, setChecklist] = useState(checklistItems);

  const toggleChecklist = (idx: number) => {
    setChecklist(prev => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item));
  };

  const completedCount = checklist.filter(i => i.done).length;
  const totalCount = checklist.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Compliance Dashboard</h2>
            <p className="text-muted-foreground">Safety compliance tracking and management</p>
          </div>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium">Overall Compliance</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{complianceScore}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-medium">Certifications</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{certifications.filter(c => c.status === 'valid').length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {certifications.filter(c => c.status === 'expiring').length} expiring soon
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-medium">Training Rate</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {Math.round(trainingCompletion.reduce((a, b) => a + b.completed, 0) / trainingCompletion.reduce((a, b) => a + b.enrolled, 0) * 100)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Overall completion</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-medium">Upcoming Audits</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{audits.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Scheduled audits</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Shield className="h-4 w-4 text-green-400" />
                Overall Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ComplianceGauge score={complianceScore} />
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last updated: Today 09:00 AM
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Department Compliance
              </CardTitle>
              <CardDescription>Compliance rate vs target by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptCompliance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Award className="h-4 w-4 text-yellow-400" />
                Certification Expiry Timeline
              </CardTitle>
              <CardDescription>Worker certifications nearing expiry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {certifications.map((cert) => {
                  const statusColor = cert.status === 'valid' ? 'text-green-400' : cert.status === 'expiring' ? 'text-yellow-400' : 'text-red-400';
                  const statusLabel = cert.status === 'valid' ? 'Valid' : cert.status === 'expiring' ? 'Expiring' : 'Expired';
                  return (
                    <div key={cert.name} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.worker} · Expires {cert.expiry}</p>
                      </div>
                      <Badge className={`ml-2 text-[10px] ${statusColor} border-current`}>{statusLabel}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                Training Completion Rates
              </CardTitle>
              <CardDescription>Completed vs enrolled by module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingCompletion.map((t) => {
                  const pct = Math.round((t.completed / t.enrolled) * 100);
                  return (
                    <div key={t.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">{t.name}</span>
                        <span className="text-xs text-muted-foreground">{t.completed}/{t.enrolled} ({pct}%)</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Compliance Checklist
              </CardTitle>
              <CardDescription>{completedCount}/{totalCount} items completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Progress</span>
                  <span className="font-medium text-white">{progressPct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {checklist.map((item, idx) => (
                  <div key={idx} onClick={() => toggleChecklist(idx)} className="cursor-pointer">
                    <ChecklistRow {...item} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Calendar className="h-4 w-4 text-purple-400" />
                Upcoming Audit Schedule
              </CardTitle>
              <CardDescription>Scheduled compliance audits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audits.map((audit, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10">
                        <Calendar className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{audit.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {audit.area} · {audit.auditor}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">{audit.date}</Badge>
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
