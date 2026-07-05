import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, Activity, Shield, BarChart3, PieChart as PieChartIcon,
  Cpu, Zap, Download,
} from 'lucide-react';

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const chartTooltipStyle = {
  contentStyle: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' },
  labelStyle: { color: 'hsl(var(--foreground))' },
};

const incidentTrendData = [
  { day: 'Jun 6', low: 3, medium: 2, high: 1, critical: 0 },
  { day: 'Jun 8', low: 2, medium: 3, high: 2, critical: 1 },
  { day: 'Jun 10', low: 4, medium: 1, high: 0, critical: 0 },
  { day: 'Jun 12', low: 1, medium: 4, high: 2, critical: 1 },
  { day: 'Jun 14', low: 3, medium: 2, high: 3, critical: 0 },
  { day: 'Jun 16', low: 2, medium: 3, high: 1, critical: 2 },
  { day: 'Jun 18', low: 5, medium: 2, high: 2, critical: 0 },
  { day: 'Jun 20', low: 3, medium: 4, high: 1, critical: 1 },
  { day: 'Jun 22', low: 2, medium: 1, high: 3, critical: 2 },
  { day: 'Jun 24', low: 4, medium: 3, high: 0, critical: 0 },
  { day: 'Jun 26', low: 1, medium: 2, high: 2, critical: 1 },
  { day: 'Jun 28', low: 3, medium: 3, high: 1, critical: 0 },
  { day: 'Jun 30', low: 2, medium: 2, high: 3, critical: 1 },
  { day: 'Jul 2', low: 4, medium: 1, high: 1, critical: 0 },
  { day: 'Jul 4', low: 2, medium: 3, high: 2, critical: 0 },
];

const highRiskZones = [
  { zone: 'Chemical Storage', risk: 85 },
  { zone: 'Assembly Line 3', risk: 72 },
  { zone: 'Waste Disposal', risk: 65 },
  { zone: 'Electrical Room B', risk: 58 },
  { zone: 'Warehouse C', risk: 45 },
  { zone: 'Lab B', risk: 38 },
];

const workerScores = [
  { name: 'Alice M.', score: 98, dept: 'Lab' },
  { name: 'Bob K.', score: 95, dept: 'Production' },
  { name: 'Carol S.', score: 92, dept: 'Assembly' },
  { name: 'David L.', score: 34, dept: 'Warehouse' },
  { name: 'Eve R.', score: 28, dept: 'Maintenance' },
  { name: 'Frank W.', score: 22, dept: 'Assembly' },
];

const complianceByDept = [
  { name: 'Production', value: 94 },
  { name: 'Assembly', value: 88 },
  { name: 'Warehouse', value: 76 },
  { name: 'Lab', value: 96 },
  { name: 'Maintenance', value: 82 },
];

const pieColors = ['#22c55e', '#eab308', '#f97316', '#3b82f6', '#8b5cf6'];

const aiMetrics = [
  { day: 'Week 1', accuracy: 94, precision: 91, recall: 89 },
  { day: 'Week 2', accuracy: 95, precision: 92, recall: 90 },
  { day: 'Week 3', accuracy: 93, precision: 90, recall: 88 },
  { day: 'Week 4', accuracy: 96, precision: 93, recall: 91 },
  { day: 'Week 5', accuracy: 95, precision: 94, recall: 92 },
  { day: 'Week 6', accuracy: 97, precision: 95, recall: 93 },
];

const equipmentHealth = [
  { name: 'Conveyors', health: 92 },
  { name: 'Robotic Arms', health: 88 },
  { name: 'Sensors', health: 96 },
  { name: 'HVAC', health: 74 },
  { name: 'Safety Gear', health: 68 },
  { name: 'Electrical', health: 81 },
];

const productivityData = [
  { month: 'Jan', output: 88, efficiency: 85, safety: 90 },
  { month: 'Feb', output: 85, efficiency: 82, safety: 87 },
  { month: 'Mar', output: 90, efficiency: 88, safety: 92 },
  { month: 'Apr', output: 87, efficiency: 86, safety: 89 },
  { month: 'May', output: 92, efficiency: 90, safety: 94 },
  { month: 'Jun', output: 91, efficiency: 89, safety: 93 },
];

const sections = [
  { key: 'incidents', label: 'Incident Trends', icon: TrendingUp },
  { key: 'zones', label: 'High-Risk Zones', icon: Activity },
  { key: 'workers', label: 'Worker Scores', icon: BarChart3 },
  { key: 'compliance', label: 'Compliance Rate', icon: PieChartIcon },
  { key: 'ai', label: 'AI Accuracy', icon: Cpu },
  { key: 'equipment', label: 'Equipment Health', icon: Zap },
  { key: 'productivity', label: 'Productivity', icon: Shield },
] as const;

type SectionKey = typeof sections[number]['key'];

export function AnalyticsPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>('incidents');

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Analytics</h2>
            <p className="text-muted-foreground">Comprehensive safety and performance analytics</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => (
            <Button
              key={sec.key}
              variant={activeSection === sec.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(sec.key)}
              className={activeSection !== sec.key ? 'border-border text-muted-foreground' : ''}
            >
              <sec.icon className="mr-1.5 h-4 w-4" />
              {sec.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {activeSection === 'incidents' && (
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Incident Trends (Last 30 Days)
              </CardTitle>
              <CardDescription>Color-coded by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={incidentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeSection === 'zones' && (
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Activity className="h-4 w-4 text-red-400" />
                High-Risk Zones
              </CardTitle>
              <CardDescription>Risk scores by factory zone</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={highRiskZones} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis dataKey="zone" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={120} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                    {highRiskZones.map((entry, idx) => (
                      <Cell key={idx} fill={entry.risk >= 70 ? '#ef4444' : entry.risk >= 50 ? '#f97316' : '#eab308'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeSection === 'workers' && (
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <BarChart3 className="h-4 w-4 text-green-400" />
                Worker Safety Scores
              </CardTitle>
              <CardDescription>Top and bottom performing workers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={workerScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {workerScores.map((entry, idx) => (
                      <Cell key={idx} fill={entry.score >= 80 ? '#22c55e' : entry.score >= 60 ? '#eab308' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeSection === 'compliance' && (
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <PieChartIcon className="h-4 w-4 text-purple-400" />
                Compliance Rate by Department
              </CardTitle>
              <CardDescription>Safety compliance distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
                <ResponsiveContainer width={300} height={300}>
                  <PieChart>
                    <Pie
                      data={complianceByDept}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      paddingAngle={3} dataKey="value"
                    >
                      {complianceByDept.map((_, idx) => (
                        <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 md:mt-0">
                  {complianceByDept.map((d, idx) => (
                    <div key={d.name} className="flex items-center gap-3 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ background: pieColors[idx] }} />
                      <span className="text-white">{d.name}</span>
                      <span className="text-muted-foreground">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeSection === 'ai' && (
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Cpu className="h-4 w-4 text-cyan-400" />
                AI Accuracy Metrics
              </CardTitle>
              <CardDescription>Accuracy, precision, and recall over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={aiMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis domain={[80, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="precision" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="recall" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeSection === 'equipment' && (
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Zap className="h-4 w-4 text-yellow-400" />
                Equipment Health Scores
              </CardTitle>
              <CardDescription>Health scores by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={equipmentHealth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="health" radius={[4, 4, 0, 0]}>
                    {equipmentHealth.map((entry, idx) => (
                      <Cell key={idx} fill={entry.health >= 80 ? '#22c55e' : entry.health >= 60 ? '#eab308' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeSection === 'productivity' && (
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
                <Shield className="h-4 w-4 text-emerald-400" />
                Productivity Metrics
              </CardTitle>
              <CardDescription>Output, efficiency, and safety trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={productivityData}>
                  <defs>
                    <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis domain={[70, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="output" stroke="#22c55e" fill="url(#outputGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fill="url(#effGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="safety" stroke="#8b5cf6" fill="url(#safeGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
