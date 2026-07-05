import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { api } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import {
  Activity, AlertTriangle, Thermometer, Wind, Radio, Camera,
  Heart, Map, Users, Bell, Zap, Siren, Clock,
  Wifi, WifiOff, ChevronUp, ChevronDown, Minus,
} from 'lucide-react';
import type {
  DashboardSummary, LiveWorkerStatus, LiveAlert,
  EmergencyEvent, FusionResult, RiskLevel, RiskTrend,
} from '../types';

function getRiskColor(level: RiskLevel | string): string {
  const map: Record<string, string> = {
    safe: 'text-green-400 border-green-500/30 bg-green-500/10',
    warning: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    high_risk: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  };
  return map[level] || 'text-muted-foreground border-border bg-muted/10';
}

function getRiskBg(level: RiskLevel | string): string {
  const map: Record<string, string> = {
    safe: 'bg-green-500', warning: 'bg-yellow-500',
    high_risk: 'bg-orange-500', critical: 'bg-red-500',
  };
  return map[level] || 'bg-muted-foreground';
}

function RiskGauge({ score, level, trend }: { score: number; level: RiskLevel; trend?: RiskTrend }) {
  const pct = Math.round(score * 100);
  const TrendIcon = trend === 'improving' ? ChevronDown : trend === 'degrading' ? ChevronUp : Minus;
  const trendColor = trend === 'improving' ? 'text-green-400' : trend === 'degrading' ? 'text-red-400' : 'text-muted-foreground';

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgb(51 65 85)" strokeWidth="6" />
          <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="6"
            strokeDasharray={`${pct * 1.884} 188.4`} className={getRiskBg(level)} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
          {pct}
        </span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRiskColor(level)}`}>
            {level.replace('_', ' ').toUpperCase()}
          </span>
          {trend && <TrendIcon className={`h-4 w-4 ${trendColor}`} />}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Overall Risk Score</p>
      </div>
    </div>
  );
}

function WorkerCard({ worker }: { worker: LiveWorkerStatus }) {
  const statusColor = worker.isOnline ? 'text-green-400' : 'text-red-400';
  const StatusIcon = worker.isOnline ? Wifi : WifiOff;

  return (
    <div className={`rounded-lg border p-3 transition-colors ${getRiskColor(worker.riskLevel)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-white`}>
            {worker.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{worker.name}</p>
            <p className="text-xs text-muted-foreground">{worker.employeeId} · {worker.department}</p>
          </div>
        </div>
        <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className={`font-semibold ${getRiskColor(worker.riskLevel).split(' ')[0]}`}>
          Risk: {Math.round(worker.riskScore * 100)}%
        </span>
        {worker.location && <span>📍 {worker.location.zone || `${worker.location.lat.toFixed(2)}, ${worker.location.lng.toFixed(2)}`}</span>}
        <span>· {worker.designation}</span>
      </div>
      {worker.vitals && (
        <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
          {worker.vitals.heartRate && <span>♥ {worker.vitals.heartRate} bpm</span>}
          {worker.vitals.spo2 !== undefined && <span>O2 {worker.vitals.spo2}%</span>}
          {worker.vitals.temperature && <span>🌡 {worker.vitals.temperature}°C</span>}
          {worker.vitals.fallDetected && <span className="text-red-400 font-semibold">⚠ FALL</span>}
        </div>
      )}
    </div>
  );
}

function AlertFeed({ alerts }: { alerts: LiveAlert[] }) {
  return (
    <div className="space-y-2">
      {alerts.slice(0, 8).map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
          <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${getRiskColor(alert.severity)}`}>
            <AlertTriangle className="h-3 w-3" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-white">{alert.title}</p>
              <Badge className={`text-[10px] ${getRiskColor(alert.severity)}`}>
                {alert.severity}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{alert.zone} · {new Date(alert.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      ))}
      {alerts.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No active alerts</p>
      )}
    </div>
  );
}

function HeatmapGrid() {
  const zones = [
    { name: 'A1', risk: 0.1 }, { name: 'A2', risk: 0.3 }, { name: 'A3', risk: 0.6 }, { name: 'A4', risk: 0.8 },
    { name: 'B1', risk: 0.2 }, { name: 'B2', risk: 0.4 }, { name: 'B3', risk: 0.1 }, { name: 'B4', risk: 0.2 },
    { name: 'C1', risk: 0.05 }, { name: 'C2', risk: 0.15 }, { name: 'C3', risk: 0.25 }, { name: 'C4', risk: 0.1 },
    { name: 'D1', risk: 0.5 }, { name: 'D2', risk: 0.7 }, { name: 'D3', risk: 0.9 }, { name: 'D4', risk: 0.6 },
  ];

  function heatColor(risk: number): string {
    if (risk >= 0.7) return 'bg-red-500/40 border-red-500/50';
    if (risk >= 0.45) return 'bg-orange-500/30 border-orange-500/40';
    if (risk >= 0.2) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-green-500/10 border-green-500/20';
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {zones.map((zone) => (
        <div key={zone.name}
          className={`flex items-center justify-center rounded border p-2 text-xs font-medium transition-colors ${heatColor(zone.risk)}`}>
          <div className="text-center">
            <div className="text-white">{zone.name}</div>
            <div className="text-[10px] text-muted-foreground">{Math.round(zone.risk * 100)}%</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmergencyPanel({ emergencies, onAcknowledge, onResolve }: {
  emergencies: EmergencyEvent[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  if (emergencies.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No active emergencies</p>;
  }

  return (
    <div className="space-y-2">
      {emergencies.map((em) => (
        <div key={em._id} className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-red-400" />
              <span className="text-sm font-semibold text-white">{em.title}</span>
              <Badge className={getRiskColor(em.severity)}>{em.severity}</Badge>
            </div>
            <Badge className="text-[10px] text-muted-foreground">{em.type.replace(/_/g, ' ')}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{em.description}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {em.requiresEvacuation && <span className="text-yellow-400">🚨 Evacuation required</span>}
            {em.location?.zone && <span>📍 {em.location.zone}</span>}
            <span>· {new Date(em.createdAt).toLocaleTimeString()}</span>
          </div>
          {em.status === 'active' && (
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onAcknowledge(em._id)}
                className="h-7 border-border text-xs text-foreground hover:bg-accent">
                Acknowledge
              </Button>
              <Button size="sm" onClick={() => onResolve(em._id)}
                className="h-7 bg-green-600 text-xs text-white hover:bg-green-700">
                Resolve
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const modalityIcons: Record<string, React.ReactNode> = {
  vision: <Camera className="h-4 w-4" />,
  audio: <Radio className="h-4 w-4" />,
  wearable: <Heart className="h-4 w-4" />,
  environmental: <Wind className="h-4 w-4" />,
  location: <Map className="h-4 w-4" />,
  machine_health: <Zap className="h-4 w-4" />,
};

export function LiveDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [workers, setWorkers] = useState<LiveWorkerStatus[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskHistory, setRiskHistory] = useState<number[]>([]);
  const { subscribe, joinRoom } = useSocket();

  useEffect(() => {
    loadData();
    joinRoom('worker-updates');
    joinRoom('fusion-events');
    joinRoom('emergency-events');
  }, [joinRoom]);

  useEffect(() => {
    const unsub1 = subscribe('worker:status-update', (data: unknown) => {
      const update = data as LiveWorkerStatus;
      setWorkers(prev => {
        const idx = prev.findIndex(w => w.workerId === update.workerId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = update;
          return next;
        }
        return [update, ...prev];
      });
    });

    const unsub2 = subscribe('fusion:update', (data: unknown) => {
      const fusion = data as FusionResult;
      setSummary(prev => prev ? {
        ...prev,
        fusion: {
          overallRiskScore: fusion.overallRiskScore,
          riskLevel: fusion.riskLevel,
          temporalTrend: fusion.temporalTrend,
        },
      } : prev);
      setRiskHistory(prev => [...prev.slice(-19), fusion.overallRiskScore]);
    });

    const unsub3 = subscribe('emergency:new', (data: unknown) => {
      const em = data as EmergencyEvent;
      setEmergencies(prev => [em, ...prev]);
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [subscribe]);

  async function loadData() {
    try {
      const [sumRes, workerRes, alertRes, emRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getWorkerStatuses(),
        api.getAlerts(20),
        api.getEmergencies(true),
      ]);
      if (sumRes.data) setSummary(sumRes.data);
      if (workerRes.data) setWorkers(workerRes.data);
      if (alertRes.data) setAlerts(alertRes.data);
      if (emRes.data) setEmergencies(emRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAcknowledge = useCallback(async (id: string) => {
    try {
      await api.acknowledgeEmergency(id);
      setEmergencies(prev => prev.filter(e => e._id !== id));
    } catch { /* ignore */ }
  }, []);

  const handleResolve = useCallback(async (id: string) => {
    try {
      await api.resolveEmergency(id);
      setEmergencies(prev => prev.filter(e => e._id !== id));
    } catch { /* ignore */ }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const topRiskWorkers = [...workers]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Live Monitoring</h2>
          <p className="text-muted-foreground">Real-time multimodal safety intelligence</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {summary?.timestamp ? new Date(summary.timestamp).toLocaleTimeString() : '--'}
        </div>
      </div>

      {/* Risk Gauge + Key Metrics */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card lg:col-span-1">
          <CardContent className="p-4">
            {summary && (
              <RiskGauge score={summary.fusion.overallRiskScore} level={summary.fusion.riskLevel} trend={summary.fusion.temporalTrend} />
            )}
            {riskHistory.length > 0 && (
              <div className="mt-3 flex items-end gap-[2px]">
                {riskHistory.map((v, i) => (
                  <div key={i} className="flex-1" style={{ height: `${Math.max(4, v * 40)}px`, background: v > 0.7 ? '#ef4444' : v > 0.45 ? '#f97316' : v > 0.2 ? '#eab308' : '#22c55e' }} title={`${Math.round(v * 100)}%`} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {summary && (
          <>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">Workers</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-white">{summary.workers.total}</p>
                <div className="mt-1 flex gap-3 text-xs">
                  <span className="text-green-400">{summary.workers.online} online</span>
                  <span className="text-red-400">{summary.workers.offline} offline</span>
                  {summary.workers.highRisk > 0 && (
                    <span className="text-red-400 font-semibold">{summary.workers.highRisk} at risk</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-medium">Alerts</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-white">{summary.alerts.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Active safety alerts</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Siren className="h-4 w-4" />
                  <span className="text-xs font-medium">Emergencies</span>
                </div>
                <p className={`mt-1 text-2xl font-bold ${summary.emergencies > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {summary.emergencies}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{summary.emergencies > 0 ? 'Active emergencies' : 'All clear'}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Worker Status */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Users className="h-4 w-4 text-blue-400" />
              High Risk Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRiskWorkers.map(w => <WorkerCard key={w.workerId} worker={w} />)}
              {topRiskWorkers.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No workers monitored</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Alert Feed */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Bell className="h-4 w-4 text-yellow-400" />
              AI Alert Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertFeed alerts={alerts} />
          </CardContent>
        </Card>

        {/* Emergency Panel */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Siren className="h-4 w-4 text-red-400" />
              Emergency Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmergencyPanel emergencies={emergencies} onAcknowledge={handleAcknowledge} onResolve={handleResolve} />
          </CardContent>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Factory Heatmap */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Map className="h-4 w-4 text-emerald-400" />
              Factory Zone Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapGrid />
          </CardContent>
        </Card>

        {/* Camera Feeds / Sensors */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Camera className="h-4 w-4 text-cyan-400" />
              Camera Feeds & Sensors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {['Entrance A', 'Assembly Line 3', 'Warehouse B', 'Chemical Storage'].map((cam) => (
                <div key={cam} className="relative aspect-video rounded-lg border border-border bg-muted/30">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-1 text-xs text-muted-foreground">{cam}</p>
                      <span className="mt-1 inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-400">
                        ● Live
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <div className="rounded bg-muted/30 p-2 text-center">
                <Thermometer className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">24.5°C</p>
              </div>
              <div className="rounded bg-muted/30 p-2 text-center">
                <Wind className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">42% RH</p>
              </div>
              <div className="rounded bg-muted/30 p-2 text-center">
                <Activity className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">85 dB</p>
              </div>
              <div className="rounded bg-muted/30 p-2 text-center">
                <Zap className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">AQI 42</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modality Scores */}
      {summary && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-white">
              <Activity className="h-4 w-4 text-purple-400" />
              Multimodal Fusion Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {Object.entries({
                vision: 'Vision', audio: 'Audio', wearable: 'Wearable',
                environmental: 'Environment', location: 'Location', machine_health: 'Machinery',
              }).map(([key, label]) => {
                const score = 0;
                const level: RiskLevel = score > 0.7 ? 'critical' : score > 0.45 ? 'high_risk' : score > 0.2 ? 'warning' : 'safe';
                return (
                  <div key={key} className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                    <div className="flex justify-center text-muted-foreground">
                      {modalityIcons[key] || <Activity className="h-4 w-4" />}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                    <div className="mt-1.5 flex items-center justify-center gap-1">
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${getRiskBg(level)}`} style={{ width: `${Math.round(score * 100)}%` }} />
                      </div>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      No data streaming
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
