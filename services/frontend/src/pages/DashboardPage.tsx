import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, CheckCircle, Users, Shield,
  Cpu, Radio, Factory, BarChart3, TrendingUp, Target,
  Bell, MapPin, Zap, Eye, ArrowRight, Wrench,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

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
  { day: 'Mon', incidents: 3, resolved: 2 },
  { day: 'Tue', incidents: 5, resolved: 4 },
  { day: 'Wed', incidents: 2, resolved: 2 },
  { day: 'Thu', incidents: 4, resolved: 3 },
  { day: 'Fri', incidents: 6, resolved: 5 },
  { day: 'Sat', incidents: 1, resolved: 1 },
  { day: 'Sun', incidents: 2, resolved: 2 },
];

const riskData = [
  { name: 'Low', value: 45, color: '#22c55e' },
  { name: 'Medium', value: 28, color: '#f59e0b' },
  { name: 'High', value: 15, color: '#f97316' },
  { name: 'Critical', value: 8, color: '#ef4444' },
];

const statCards = [
  { label: 'Active Incidents', value: '8', icon: AlertTriangle, trend: '-3', up: false, color: 'from-red-500/20 to-red-600/10', iconColor: 'text-red-400' },
  { label: 'Workers Online', value: '247', icon: Users, trend: '+12', up: true, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400' },
  { label: 'Risk Score', value: '76', icon: Activity, trend: '-5%', up: false, color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-400' },
  { label: 'Resolved Today', value: '14', icon: CheckCircle, trend: '+4', up: true, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400' },
  { label: 'Devices Active', value: '1,892', icon: Radio, trend: '+8%', up: true, color: 'from-cyan-500/20 to-cyan-600/10', iconColor: 'text-cyan-400' },
  { label: 'Factories Monitored', value: '6', icon: Factory, trend: '0', up: true, color: 'from-violet-500/20 to-violet-600/10', iconColor: 'text-violet-400' },
];

const quickActions = [
  { label: 'Report Incident', icon: AlertTriangle, href: '/incidents', color: 'from-red-500 to-rose-600' },
  { label: 'View Map', icon: MapPin, href: '/map', color: 'from-blue-500 to-cyan-600' },
  { label: 'Run Analytics', icon: BarChart3, href: '/analytics', color: 'from-emerald-500 to-teal-600' },
  { label: 'Open Monitor', icon: Eye, href: '/monitor', color: 'from-orange-500 to-amber-600' },
  { label: 'Check Compliance', icon: Shield, href: '/compliance', color: 'from-violet-500 to-purple-600' },
];

const activeIncidents = [
  {
    _id: 'i1', type: 'Gas Leak', description: 'Gas leak detected in Zone A - Assembly',
    location: 'Zone A - Assembly', severity: 'critical' as const,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    assigned: { name: 'Marcus Chen', initials: 'MC' },
  },
  {
    _id: 'i2', type: 'Temp Spike', description: 'Temperature spike on Assembly Line 3',
    location: 'Zone D - Line 3', severity: 'high' as const,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    assigned: { name: 'Sarah Kim', initials: 'SK' },
  },
  {
    _id: 'i3', type: 'Equipment Fault', description: 'Conveyor belt malfunction - Section B',
    location: 'Zone B - Storage', severity: 'medium' as const,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    assigned: { name: 'James Wong', initials: 'JW' },
  },
  {
    _id: 'i4', type: 'Vibration Anomaly', description: 'Abnormal vibration in Pump 4',
    location: 'North Facility - Pump Station', severity: 'high' as const,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    assigned: { name: 'Elena Rodriguez', initials: 'ER' },
  },
  {
    _id: 'i5', type: 'Pressure Drop', description: 'Pressure drop in chemical line B',
    location: 'Zone C - Chemical Processing', severity: 'critical' as const,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    assigned: { name: 'David Park', initials: 'DP' },
  },
  {
    _id: 'i6', type: 'Noise Alert', description: 'Ambient noise exceeding safe levels',
    location: 'Warehouse 2 - Packing Area', severity: 'low' as const,
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    assigned: { name: 'Lisa Thompson', initials: 'LT' },
  },
];

const workerStatuses = [
  { _id: 'w1', name: 'Marcus Chen', role: 'Safety Officer', zone: 'Zone A - Assembly', online: true, lastPing: '2 min ago', initials: 'MC' },
  { _id: 'w2', name: 'Sarah Kim', role: 'Shift Lead', zone: 'Zone D - Line 3', online: true, lastPing: '1 min ago', initials: 'SK' },
  { _id: 'w3', name: 'James Wong', role: 'Maintenance Tech', zone: 'Zone B - Storage', online: false, lastPing: '15 min ago', initials: 'JW' },
  { _id: 'w4', name: 'Elena Rodriguez', role: 'Chemical Engineer', zone: 'North Facility', online: true, lastPing: '3 min ago', initials: 'ER' },
  { _id: 'w5', name: 'David Park', role: 'Process Operator', zone: 'Zone C - Processing', online: true, lastPing: '4 min ago', initials: 'DP' },
  { _id: 'w6', name: 'Lisa Thompson', role: 'Safety Inspector', zone: 'Warehouse 2', online: false, lastPing: '32 min ago', initials: 'LT' },
  { _id: 'w7', name: 'Robert Garcia', role: 'Plant Manager', zone: 'Main Plant - Office', online: true, lastPing: 'just now', initials: 'RG' },
  { _id: 'w8', name: 'Amy Patel', role: 'HSE Coordinator', zone: 'Main Plant - Control', online: true, lastPing: '5 min ago', initials: 'AP' },
];

const activities = [
  { id: 'a1', type: 'incident', description: 'Critical: Gas leak contained in Zone A', time: new Date(Date.now() - 600000).toISOString(), icon: AlertTriangle },
  { id: 'a2', type: 'resolution', description: 'Resolved: Temperature sensor recalibrated', time: new Date(Date.now() - 1800000).toISOString(), icon: CheckCircle },
  { id: 'a3', type: 'alert', description: 'Vibration alert triggered on Pump 4', time: new Date(Date.now() - 3600000).toISOString(), icon: Bell },
  { id: 'a4', type: 'report', description: 'Daily safety report generated - all zones', time: new Date(Date.now() - 7200000).toISOString(), icon: Activity },
  { id: 'a5', type: 'drill', description: 'Emergency drill completed - 4.2 min response', time: new Date(Date.now() - 14400000).toISOString(), icon: Target },
  { id: 'a6', type: 'cert', description: 'Equipment cert: Fire suppression system OK', time: new Date(Date.now() - 28800000).toISOString(), icon: Shield },
];

const equipmentHealth = [
  { name: 'Gas Sensors', status: 'online', value: 98, icon: Radio },
  { name: 'Fire Suppression', status: 'online', value: 100, icon: Shield },
  { name: 'HVAC System', status: 'warning', value: 72, icon: Wrench },
  { name: 'Conveyor Belts', status: 'online', value: 88, icon: Cpu },
  { name: 'Chemical Pumps', status: 'critical', value: 34, icon: Zap },
  { name: 'Security Cameras', status: 'online', value: 96, icon: Eye },
];

const severityConfig = {
  critical: { badge: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400', label: 'Critical' },
  high: { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400', label: 'High' },
  medium: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400', label: 'Medium' },
  low: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', label: 'Low' },
};

const equipmentStatusConfig: Record<string, { dot: string; text: string; label: string }> = {
  online: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Online' },
  warning: { dot: 'bg-amber-400', text: 'text-amber-400', label: 'Warning' },
  critical: { dot: 'bg-red-400', text: 'text-red-400', label: 'Critical' },
  offline: { dot: 'bg-muted-foreground', text: 'text-muted-foreground', label: 'Offline' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName || 'Operator';
  const safetyStreak = 7;

  const totalIncidents = weeklyData.reduce((acc, d) => acc + d.incidents, 0);
  const totalResolved = weeklyData.reduce((acc, d) => acc + d.resolved, 0);
  const safetyScore = 87;

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            All systems nominal &middot; {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Day {safetyStreak} safety streak</span>
            <Shield className="h-4 w-4 text-emerald-400" />
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
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Safety Streak</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">
                  {safetyStreak} Days Incident-Free
                </p>
                <p className="text-muted-foreground max-w-lg">
                  Outstanding work! Your commitment to safety protocols keeps everyone protected. Every shift matters.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex -space-x-2">
                  {['MC', 'SK', 'JW'].map((initials, i) => (
                    <Avatar key={i} className="h-10 w-10 border-2 border-card">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-blue-500 text-xs font-bold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <Button className="gap-2 rounded-full">
                  <Shield className="h-4 w-4" />
                  Start Shift
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
                <div className={cn('p-2 rounded-lg bg-gradient-to-br', stat.color)}>
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
                  Safety Trends
                </CardTitle>
                <CardDescription>{totalIncidents} incidents reported this week</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-emerald-400" />
                {totalResolved}/{totalIncidents} resolved
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="incidentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="incidents" stroke="hsl(var(--primary))" fill="url(#incidentsGrad)" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#resolvedGrad)" strokeWidth={2} dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Risk Distribution
                </CardTitle>
                <CardDescription>Incident severity breakdown</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 w-full sm:w-auto shrink-0">
                {riskData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-foreground min-w-[80px]">{item.name}</span>
                    <span className="text-muted-foreground font-mono">{item.value}</span>
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
              <div className={cn('p-2.5 rounded-lg bg-gradient-to-br', action.color, 'shadow-lg')}>
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
          <h2 className="text-lg font-semibold">Active Incidents</h2>
          <Link to="/incidents" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {activeIncidents.map((incident) => {
            const sev = severityConfig[incident.severity];
            return (
              <Card key={incident._id} className="min-w-[280px] sm:min-w-[320px] border-border bg-card card-hover shrink-0">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className={cn('text-xs font-medium border', sev.badge)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5', sev.dot)} />
                      {sev.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{timeAgo(incident.timestamp)}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{incident.type}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{incident.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                          {incident.assigned.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{incident.assigned.name.split(' ')[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Worker Status
            </CardTitle>
            <CardDescription>{workerStatuses.filter((w) => w.online).length} online &middot; {workerStatuses.length} total</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {workerStatuses.map((worker) => (
                <div key={worker._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 text-foreground font-medium">
                        {worker.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card',
                      worker.online ? 'bg-emerald-400' : 'bg-muted-foreground',
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{worker.name}</span>
                      <span className="text-[11px] text-muted-foreground">({worker.role})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{worker.zone}</span>
                      <span className="shrink-0">&middot; {worker.lastPing}</span>
                    </div>
                  </div>
                  <div className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    worker.online ? 'bg-emerald-400' : 'bg-muted-foreground',
                  )} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-0">
              {activities.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {idx < activities.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                    )}
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 border-card',
                      activity.type === 'incident' && 'bg-red-500/10',
                      activity.type === 'resolution' && 'bg-emerald-500/10',
                      activity.type === 'alert' && 'bg-amber-500/10',
                      activity.type !== 'incident' && activity.type !== 'resolution' && activity.type !== 'alert' && 'bg-primary/10',
                    )}>
                      <Icon className={cn(
                        'h-3.5 w-3.5',
                        activity.type === 'incident' && 'text-red-400',
                        activity.type === 'resolution' && 'text-emerald-400',
                        activity.type === 'alert' && 'text-amber-400',
                        activity.type !== 'incident' && activity.type !== 'resolution' && activity.type !== 'alert' && 'text-primary',
                      )} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(activity.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-tr-full pointer-events-none" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Safety Score
            </CardTitle>
            <CardDescription>Overall facility safety rating</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-5 relative">
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - safetyScore / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{safetyScore}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-lg font-bold text-emerald-400">45</p>
                <p className="text-xs text-muted-foreground">Low Risk</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-lg font-bold text-amber-400">28</p>
                <p className="text-xs text-muted-foreground">Medium Risk</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <p className="text-lg font-bold text-red-400">8</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly Target</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2.5" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-3 w-3 text-primary" />
                <span>5 more incident-free days to reach target</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                Equipment Health
              </CardTitle>
              <Badge variant="outline" className="text-xs">{equipmentHealth.filter((e) => e.status === 'online').length} online</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              {equipmentHealth.map((equip) => {
                const cfg = equipmentStatusConfig[equip.status];
                const Icon = equip.icon;
                return (
                  <div key={equip.name} className="p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        equip.status === 'online' && 'bg-emerald-500/10',
                        equip.status === 'warning' && 'bg-amber-500/10',
                        equip.status === 'critical' && 'bg-red-500/10',
                      )}>
                        <Icon className={cn(
                          'h-4 w-4',
                          equip.status === 'online' && 'text-emerald-400',
                          equip.status === 'warning' && 'text-amber-400',
                          equip.status === 'critical' && 'text-red-400',
                        )} />
                      </div>
                      <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                    </div>
                    <p className="text-sm font-medium truncate">{equip.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={cn('text-xs', cfg.text)}>{cfg.label}</span>
                      <span className="text-xs text-muted-foreground font-mono">{equip.value}%</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            equip.value >= 85 ? 'bg-emerald-400' : equip.value >= 60 ? 'bg-amber-400' : 'bg-red-400',
                          )}
                          style={{ width: `${equip.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
