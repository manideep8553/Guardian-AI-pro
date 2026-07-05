import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  ClipboardList, Shield, Calendar, Bell, Eye,
  CheckCircle, Search, Siren, FileText, MapPin, Clock,
} from 'lucide-react';
import { api } from '../services/api';
import type { Incident, LiveAlert } from '../types';

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

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? 'bg-green-500/20 text-green-400' : 'border border-muted-foreground/30'}`}>
        {done && <CheckCircle className="h-3.5 w-3.5" />}
      </div>
      <span className={`flex-1 text-sm ${done ? 'text-muted-foreground line-through' : 'text-white'}`}>{label}</span>
      {!done && <Badge className="text-[10px] text-yellow-400 border-yellow-500/30 bg-yellow-500/10">Pending</Badge>}
    </div>
  );
}

function AlertCard({ alert }: { alert: LiveAlert }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${severityBadge[alert.severity] || ''}`}>
        <Bell className="h-3 w-3" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{alert.title}</p>
          <Badge className={`text-[10px] ${severityBadge[alert.severity] || ''}`}>{alert.severity}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {alert.zone} · {new Date(alert.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

function HighRiskZoneCard({ zone, risk, workers }: { zone: string; risk: number; workers: number }) {
  const color = risk >= 70 ? 'border-red-500/30 bg-red-500/10' : risk >= 50 ? 'border-orange-500/30 bg-orange-500/10' : 'border-yellow-500/30 bg-yellow-500/10';
  const textColor = risk >= 70 ? 'text-red-400' : risk >= 50 ? 'text-orange-400' : 'text-yellow-400';
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className={`h-4 w-4 ${textColor}`} />
          <span className="text-sm font-medium text-white">{zone}</span>
        </div>
        <Badge className={`text-[10px] ${severityBadge[risk >= 70 ? 'critical' : risk >= 50 ? 'high' : 'medium']}`}>
          {risk}% Risk
        </Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{workers} workers in zone</p>
    </div>
  );
}

export function SafetyOfficerDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [incRes, alertRes] = await Promise.all([
        api.getIncidents({ limit: '30' }),
        api.getAlerts(30),
      ]);
      if (incRes.data) setIncidents(incRes.data.incidents);
      if (alertRes.data) setAlerts(alertRes.data);
    } catch (err) {
      console.error('Failed to load safety officer data', err);
    } finally {
      setLoading(false);
    }
  }

  const reviewQueue = incidents.filter(i => i.status === 'reported' || i.status === 'investigating');
  const highRiskZones = [
    { zone: 'Chemical Storage', risk: 85, workers: 6 },
    { zone: 'Assembly Line 3', risk: 72, workers: 14 },
    { zone: 'Waste Disposal', risk: 65, workers: 4 },
    { zone: 'Electrical Room B', risk: 58, workers: 2 },
  ];
  const complianceItems = [
    { label: 'PPE Compliance Check', done: true },
    { label: 'Fire Extinguisher Inspection', done: true },
    { label: 'Chemical Storage Audit', done: false },
    { label: 'Emergency Exit Drills', done: false },
    { label: 'First Aid Kit Restock', done: true },
    { label: 'Safety Signage Review', done: false },
  ];
  const complianceProgress = Math.round((complianceItems.filter(i => i.done).length / complianceItems.length) * 100);

  const inspections = [
    { date: '2026-07-08', area: 'Warehouse B', inspector: 'James Wilson', type: 'Routine' },
    { date: '2026-07-10', area: 'Chemical Lab', inspector: 'Emily Chen', type: 'Detailed' },
    { date: '2026-07-12', area: 'Assembly Lines', inspector: 'Mike Torres', type: 'Random' },
    { date: '2026-07-15', area: 'Maintenance Bay', inspector: 'Sarah Kim', type: 'Routine' },
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
            <h2 className="text-3xl font-bold tracking-tight text-white">Safety Officer Dashboard</h2>
            <p className="text-muted-foreground">Incident management and safety oversight</p>
          </div>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClipboardList className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-medium">Incident Queue</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{reviewQueue.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Need review or investigation</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-red-400" />
                <span className="text-xs font-medium">High-Risk Zones</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{highRiskZones.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Zones above threshold</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium">Compliance</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{complianceProgress}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Checklist completion</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-medium">Inspections</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{inspections.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Scheduled this week</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <ClipboardList className="h-4 w-4 text-blue-400" />
                Incident Report Queue
              </CardTitle>
              <CardDescription>Incidents pending review and investigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reviewQueue.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No incidents pending</p>
                ) : (
                  reviewQueue.slice(0, 6).map((inc) => (
                    <div key={inc._id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{inc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {inc.location?.zone || 'N/A'} · {new Date(inc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-2 flex items-center gap-1">
                        <Badge className={`text-[10px] ${severityBadge[inc.severity] || ''}`}>{inc.severity}</Badge>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {reviewQueue.length > 6 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">+{reviewQueue.length - 6} more</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Siren className="h-4 w-4 text-orange-400" />
                High-Risk Zone Alerts
              </CardTitle>
              <CardDescription>Zones exceeding risk thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {highRiskZones.map((z) => <HighRiskZoneCard key={z.zone} {...z} />)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Bell className="h-4 w-4 text-yellow-400" />
                Recent Hazard Notifications
              </CardTitle>
              <CardDescription>Latest safety alerts and hazards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 6).map((a) => <AlertCard key={a.id} alert={a} />)}
                {alerts.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No recent notifications</p>
                )}
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
                <CheckCircle className="h-4 w-4 text-green-400" />
                Compliance Checklist
              </CardTitle>
              <CardDescription>Safety compliance progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Overall Progress</span>
                  <span className="font-medium text-white">{complianceProgress}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${complianceProgress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {complianceItems.map((item) => (
                  <ChecklistItem key={item.label} {...item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Calendar className="h-4 w-4 text-purple-400" />
                Safety Inspection Schedule
              </CardTitle>
              <CardDescription>Upcoming inspections and audits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inspections.map((ins, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                        <Search className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{ins.area}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {ins.date} · {ins.inspector}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">{ins.type}</Badge>
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
