import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, Zap, Target, Award, Download,
  Flame, Calendar, Activity, BarChart3, PieChart, Shield
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const dateRanges = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
];

function generateDailyData(days: number) {
  const data: { date: string; incidents: number; severity: number; resolved: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      incidents: Math.round((Math.random() * 4 + 0.5) * 10) / 10,
      severity: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
      resolved: Math.round(Math.random() * 2 * 10) / 10,
    });
  }
  return data;
}

function generateSubjectData() {
  return [
    { subject: 'Safety Incidents', hours: 28.5, color: '#6366f1' },
    { subject: 'Equipment Health', hours: 35.2, color: '#3b82f6' },
    { subject: 'Worker Compliance', hours: 18.7, color: '#10b981' },
    { subject: 'Environmental', hours: 12.3, color: '#f59e0b' },
    { subject: 'Training', hours: 8.1, color: '#ef4444' },
  ];
}

function generateDistributionData() {
  return [
    { name: 'Incidents', value: 65, color: '#6366f1' },
    { name: 'Inspections', value: 20, color: '#3b82f6' },
    { name: 'Resolved', value: 15, color: '#10b981' },
  ];
}

function generateHeatmapData() {
  const data: { date: string; count: number; dayOfWeek: number; week: number }[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5),
      dayOfWeek: d.getDay(),
      week: Math.floor(i / 7),
    });
  }
  return data;
}

const weekDays = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('30d');
  const dailyData = useMemo(() => {
    const dayMap: Record<string, number> = { '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365 };
    return generateDailyData(dayMap[selectedRange] || 30);
  }, [selectedRange]);
  const subjectData = generateSubjectData();
  const distributionData = generateDistributionData();
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  const stats = [
    { title: 'Total Incidents', value: '142', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', change: '-12%' },
    { title: 'Avg Risk Score', value: '3.8', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', change: '-5%' },
    { title: 'Safety Streak', value: '12 days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', change: '+3' },
    { title: 'Inspections', value: '48', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10', change: '+8' },
    { title: 'Alerts Resolved', value: '86', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', change: '+15%' },
  ];

  const streakMetrics = [
    { label: 'Safety Streak', value: '12 days', icon: Flame, color: 'text-orange-500' },
    { label: 'Longest Streak', value: '24 days', icon: Award, color: 'text-purple-500' },
    { label: 'This Week', value: '21', icon: Shield, color: 'text-blue-500' },
  ];

  const safetyScore = 78;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track safety incidents and compliance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {dateRanges.map(range => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
                <div className={cn('p-1.5 rounded-md', stat.bg)}>
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stat.value}</div>
                <p className="text-[10px] text-emerald-500 mt-0.5">{stat.change} vs last period</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Daily Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="incidents" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                Safety Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="subject" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={90} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                      {subjectData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Severity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="severity" stroke="#8b5cf6" strokeWidth={2} fill="url(#focusGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <PieChart className="h-4 w-4 text-amber-500" />
                Safety Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distributionData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Incident Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-0.5 overflow-x-auto pb-2">
                {Array.from({ length: 53 }).map((_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-0.5">
                    {weekIdx === 0 && weekDays.map((d, i) => (
                      <div key={i} className="h-2.5 text-[6px] text-muted-foreground leading-none">{d}</div>
                    ))}
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const dataPoint = heatmapData.find(d => {
                        const date = new Date(d.date);
                        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
                        const w = Math.floor(dayOfYear / 7);
                        return w === weekIdx && date.getDay() === dayIdx;
                      });
                      const count = dataPoint?.count || 0;
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            'h-2.5 w-2.5 rounded-sm',
                            count === 0 ? 'bg-muted/50' :
                            count === 1 ? 'bg-primary/25' :
                            count === 2 ? 'bg-primary/45' :
                            count === 3 ? 'bg-primary/65' :
                            'bg-primary/90'
                          )}
                          title={dataPoint ? `${dataPoint.date}: ${count} incidents` : ''}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-1 mt-2">
                <span className="text-[10px] text-muted-foreground">Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                  <div key={level} className={cn(
                    'h-2.5 w-2.5 rounded-sm',
                    level === 0 ? 'bg-muted/50' :
                    level === 1 ? 'bg-primary/25' :
                    level === 2 ? 'bg-primary/45' :
                    level === 3 ? 'bg-primary/65' :
                    'bg-primary/90'
                  )} />
                ))}
                <span className="text-[10px] text-muted-foreground">More</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-500" />
                Safety Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {streakMetrics.map((metric, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <metric.icon className={cn('h-4 w-4', metric.color)} />
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{metric.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Safety Score
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative h-28 w-28 mx-auto mb-3">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(safetyScore / 100) * 327} 327`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{safetyScore}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Based on compliance and incident resolution</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
