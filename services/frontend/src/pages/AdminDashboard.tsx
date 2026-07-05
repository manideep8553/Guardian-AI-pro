import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users, AlertTriangle, Shield, Activity, ArrowUpRight, Wrench,
  Clock, CheckCircle, Siren, Eye, FileText, Settings, Zap,
} from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const severityColors: Record<string, string> = {
  low: 'text-green-400 border-green-500/30 bg-green-500/10',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
};

const statusColors: Record<string, string> = {
  reported: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  investigating: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  resolved: 'text-green-400 border-green-500/30 bg-green-500/10',
  closed: 'text-muted-foreground border-border bg-muted/10',
};

function AnimatedStatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color?: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className={`h-4 w-4 ${color || ''}`} />
              <span className="text-xs font-medium">{label}</span>
            </div>
          </div>
          <motion.p
            className="mt-1 text-2xl font-bold text-white"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {value}
          </motion.p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WorkerScoreChart({ data }: { data: { name: string; score: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EquipmentBar({ label, health, count }: { label: string; health: number; count: number }) {
  const barColor = health >= 80 ? 'bg-green-500' : health >= 60 ? 'bg-yellow-500' : health >= 40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white">{label}</span>
        <span className="text-xs text-muted-foreground">{count} devices</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${health}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
        <span className="w-10 text-right text-xs font-medium text-white">{health}%</span>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.getIncidents({ limit: '20' });
      setIncidents(res.data?.incidents || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    totalWorkers: 284,
    activeIncidents: incidents.filter(i => i.status === 'reported' || i.status === 'investigating').length,
    complianceRate: 94,
    avgRiskScore: 23,
  };

  const workerScores = [
    { name: 'Prod A', score: 95 }, { name: 'Prod B', score: 82 },
    { name: 'Assembly', score: 78 }, { name: 'Warehouse', score: 88 },
    { name: 'Lab', score: 92 }, { name: 'Maintenance', score: 76 },
  ];

  const equipmentHealth = [
    { label: 'Conveyors', health: 92, count: 24 },
    { label: 'Robotic Arms', health: 88, count: 16 },
    { label: 'Sensors', health: 96, count: 142 },
    { label: 'HVAC', health: 74, count: 12 },
    { label: 'Safety Gear', health: 68, count: 86 },
    { label: 'Electrical Panels', health: 81, count: 34 },
  ];

  const recentIncidents = incidents.slice(0, 5);

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
            <h2 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h2>
            <p className="text-muted-foreground">Full factory safety overview and control panel</p>
          </div>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard icon={Users} label="Total Workers" value={stats.totalWorkers} sub="Across all departments" color="text-blue-400" />
        <AnimatedStatCard icon={AlertTriangle} label="Active Incidents" value={stats.activeIncidents} sub="Requiring attention" color="text-red-400" />
        <AnimatedStatCard icon={Shield} label="Compliance Rate" value={`${stats.complianceRate}%`} sub="Overall safety compliance" color="text-green-400" />
        <AnimatedStatCard icon={Activity} label="Avg Risk Score" value={`${stats.avgRiskScore}%`} sub="Across all workers" color="text-yellow-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <FileText className="h-4 w-4 text-blue-400" />
                Recent Incidents
              </CardTitle>
              <CardDescription>Latest reported safety incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentIncidents.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No incidents reported</p>
                ) : (
                  recentIncidents.map((inc) => (
                    <div key={inc._id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{inc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {inc.location?.zone || 'N/A'} · {new Date(inc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <Badge className={`text-[10px] ${severityColors[inc.severity] || ''}`}>{inc.severity}</Badge>
                        <Badge className={`text-[10px] ${statusColors[inc.status] || ''}`}>{inc.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Activity className="h-4 w-4 text-green-400" />
                Worker Safety Scores
              </CardTitle>
              <CardDescription>Average safety scores by department</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkerScoreChart data={workerScores} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Wrench className="h-4 w-4 text-cyan-400" />
              Equipment Health Overview
            </CardTitle>
            <CardDescription>Health scores by equipment category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipmentHealth.map((eq) => (
                <EquipmentBar key={eq.label} {...eq} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Zap className="h-4 w-4 text-purple-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col gap-1 border-border bg-muted/20 text-foreground hover:bg-accent">
                <Eye className="h-5 w-5 text-blue-400" />
                <span className="text-xs">View Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1 border-border bg-muted/20 text-foreground hover:bg-accent">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-xs">Run Audit</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1 border-border bg-muted/20 text-foreground hover:bg-accent">
                <Users className="h-5 w-5 text-yellow-400" />
                <span className="text-xs">Assign Training</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1 border-border bg-muted/20 text-foreground hover:bg-accent">
                <ArrowUpRight className="h-5 w-5 text-red-400" />
                <span className="text-xs">Escalate</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1 border-border bg-muted/20 text-foreground hover:bg-accent">
                <Siren className="h-5 w-5 text-orange-400" />
                <span className="text-xs">Emergency Drill</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1 border-border bg-muted/20 text-foreground hover:bg-accent">
                <Clock className="h-5 w-5 text-cyan-400" />
                <span className="text-xs">Schedule</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1 border-border bg-muted/20 text-foreground hover:bg-accent">
                <FileText className="h-5 w-5 text-purple-400" />
                <span className="text-xs">Generate Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1 border-border bg-muted/20 text-foreground hover:bg-accent">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs">System Config</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
