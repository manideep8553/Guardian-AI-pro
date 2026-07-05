import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Wrench, AlertTriangle, Calendar, Clock, Activity, Cpu,
  Battery, CheckCircle, ChevronRight,
} from 'lucide-react';

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const equipmentCards = [
  { label: 'Total Devices', value: 314, icon: Cpu, color: 'text-blue-400' },
  { label: 'Healthy', value: 276, icon: CheckCircle, color: 'text-green-400' },
  { label: 'Needs Attention', value: 28, icon: AlertTriangle, color: 'text-yellow-400' },
  { label: 'Critical', value: 10, icon: Battery, color: 'text-red-400' },
];

const maintenanceSchedule = [
  { date: '2026-07-06', equipment: 'Conveyor Belt A3', type: 'Routine', technician: 'Mike R.', status: 'scheduled' },
  { date: '2026-07-07', equipment: 'Robotic Arm #4', type: 'Calibration', technician: 'Sarah K.', status: 'scheduled' },
  { date: '2026-07-08', equipment: 'HVAC Unit B', type: 'Filter Replacement', technician: 'John D.', status: 'scheduled' },
  { date: '2026-07-09', equipment: 'Pressure Valve #12', type: 'Inspection', technician: 'Lisa M.', status: 'pending' },
  { date: '2026-07-10', equipment: 'Generator Backup', type: 'Load Test', technician: 'Tom W.', status: 'pending' },
];

const anomalyAlerts = [
  { device: 'Temperature Sensor #08', issue: 'Abnormal temperature spike', severity: 'critical', time: '10 min ago' },
  { device: 'Vibration Monitor #03', issue: 'Frequency deviation detected', severity: 'high', time: '25 min ago' },
  { device: 'Pressure Gauge #07', issue: 'Pressure dropping below threshold', severity: 'high', time: '1h ago' },
  { device: 'Motor Drive #22', issue: 'Current draw exceeds limits', severity: 'medium', time: '2h ago' },
  { device: 'Belt Sensor #15', issue: 'Speed inconsistency', severity: 'low', time: '4h ago' },
];

const healthTrend = [
  { month: 'Jan', conveyors: 88, robotics: 92, sensors: 95, hvac: 78 },
  { month: 'Feb', conveyors: 86, robotics: 90, sensors: 94, hvac: 76 },
  { month: 'Mar', conveyors: 90, robotics: 93, sensors: 96, hvac: 80 },
  { month: 'Apr', conveyors: 87, robotics: 91, sensors: 93, hvac: 75 },
  { month: 'May', conveyors: 91, robotics: 94, sensors: 97, hvac: 78 },
  { month: 'Jun', conveyors: 89, robotics: 92, sensors: 95, hvac: 74 },
];

const immediateAttention = [
  { device: 'Conveyor Belt A3', score: 38, issue: 'Bearing wear detected', location: 'Assembly Line 1' },
  { device: 'Compressor #5', score: 42, issue: 'Pressure loss', location: 'Basement B2' },
  { device: 'Cooling Tower', score: 45, issue: 'Fan imbalance', location: 'Roof Area' },
  { device: 'Robotic Arm #7', score: 48, issue: 'Joint calibration drift', location: 'Assembly Line 3' },
];

const calibrationDue = [
  { device: 'Gas Detector #12', lastCal: '2026-01-15', dueDate: '2026-07-15', status: 'overdue' },
  { device: 'Pressure Sensor #04', lastCal: '2026-04-20', dueDate: '2026-07-20', status: 'due' },
  { device: 'Temp Gauge #22', lastCal: '2026-05-01', dueDate: '2026-08-01', status: 'upcoming' },
  { device: 'Flow Meter #08', lastCal: '2026-05-15', dueDate: '2026-08-15', status: 'upcoming' },
  { device: 'Scale Unit #03', lastCal: '2026-03-10', dueDate: '2026-09-10', status: 'upcoming' },
];

const severityColor: Record<string, string> = {
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  low: 'text-green-400 border-green-500/30 bg-green-500/10',
};

const statusColor: Record<string, string> = {
  scheduled: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  pending: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  overdue: 'text-red-400 border-red-500/30 bg-red-500/10',
  due: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  upcoming: 'text-green-400 border-green-500/30 bg-green-500/10',
};

export function PredictiveMaintenance() {
  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Predictive Maintenance</h2>
            <p className="text-muted-foreground">Equipment health monitoring and maintenance scheduling</p>
          </div>
          <Button>
            <Wrench className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {equipmentCards.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Calendar className="h-4 w-4 text-blue-400" />
                Maintenance Schedule
              </CardTitle>
              <CardDescription>Upcoming maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {maintenanceSchedule.map((ms, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{ms.equipment}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {ms.date} · {ms.type} · {ms.technician}
                      </div>
                    </div>
                    <Badge className={`ml-2 text-[10px] ${statusColor[ms.status] || ''}`}>{ms.status}</Badge>
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
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Anomaly Alerts
              </CardTitle>
              <CardDescription>Recent equipment anomalies detected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {anomalyAlerts.map((a, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
                    <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${severityColor[a.severity]}`}>
                      <AlertTriangle className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{a.device}</p>
                        <Badge className={`text-[10px] ${severityColor[a.severity]}`}>{a.severity}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.issue} · {a.time}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Activity className="h-4 w-4 text-cyan-400" />
              Health Score Trends
            </CardTitle>
            <CardDescription>Equipment health scores over time by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="conveyors" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="robotics" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sensors" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hvac" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                Devices Requiring Immediate Attention
              </CardTitle>
              <CardDescription>Devices with critical health scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {immediateAttention.map((d, idx) => (
                  <div key={idx} className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{d.device}</p>
                      <Badge className="text-[10px] text-red-400 border-red-500/30 bg-red-500/10">{d.score}%</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{d.issue}</p>
                    <p className="text-xs text-muted-foreground">{d.location}</p>
                    <Button size="sm" className="mt-2 h-7 bg-orange-600 text-xs text-white hover:bg-orange-700">
                      <Wrench className="mr-1 h-3 w-3" />
                      Inspect Now
                    </Button>
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
                Calibration Due List
              </CardTitle>
              <CardDescription>Devices requiring calibration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {calibrationDue.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                    <div>
                      <p className="text-sm font-medium text-white">{c.device}</p>
                      <p className="text-xs text-muted-foreground">
                        Last: {c.lastCal} · Due: {c.dueDate}
                      </p>
                    </div>
                    <Badge className={`text-[10px] ${statusColor[c.status] || ''}`}>{c.status}</Badge>
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
