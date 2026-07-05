import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Users, Factory, Crosshair, Layers, Maximize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconPerson = new L.DivIcon({
  className: 'bg-transparent',
  html: '<div style="background:#3b82f6;border:2px solid white;border-radius:50%;width:12px;height:12px;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const iconWarning = new L.DivIcon({
  className: 'bg-transparent',
  html: '<div style="background:#ef4444;border:2px solid white;border-radius:50%;width:16px;height:16px;box-shadow:0 0 8px rgba(239,68,68,0.6)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const iconSafeZone = new L.DivIcon({
  className: 'bg-transparent',
  html: '<div style="background:#22c55e;border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const defaultCenter: [number, number] = [28.6139, 77.2090];

const zones = [
  { name: 'Zone A1', center: [28.6145, 77.2085] as [number, number], risk: 0.15, color: '#22c55e', workers: 8 },
  { name: 'Zone A2', center: [28.6140, 77.2095] as [number, number], risk: 0.35, color: '#eab308', workers: 12 },
  { name: 'Zone B1', center: [28.6135, 77.2080] as [number, number], risk: 0.6, color: '#f97316', workers: 6 },
  { name: 'Zone B2', center: [28.6130, 77.2100] as [number, number], risk: 0.85, color: '#ef4444', workers: 4 },
  { name: 'Safe Zone', center: [28.6148, 77.2100] as [number, number], risk: 0.05, color: '#22c55e', workers: 2 },
  { name: 'Restricted', center: [28.6128, 77.2085] as [number, number], risk: 0.9, color: '#dc2626', workers: 0 },
];

const workers = [
  { id: 'w1', name: 'Rajesh Kumar', center: [28.6142, 77.2088] as [number, number], risk: 'safe' as const, zone: 'A1' },
  { id: 'w2', name: 'Priya Sharma', center: [28.6138, 77.2092] as [number, number], risk: 'warning' as const, zone: 'A2' },
  { id: 'w3', name: 'Amit Singh', center: [28.6133, 77.2082] as [number, number], risk: 'high_risk' as const, zone: 'B1' },
  { id: 'w4', name: 'Sunil Verma', center: [28.6132, 77.2098] as [number, number], risk: 'critical' as const, zone: 'B2' },
  { id: 'w5', name: 'Deepa Patel', center: [28.6146, 77.2098] as [number, number], risk: 'safe' as const, zone: 'Safe' },
];

const devices = [
  { id: 'd1', name: 'Camera-01', center: [28.6143, 77.2086] as [number, number], status: 'online' as const },
  { id: 'd2', name: 'Sensor-A2', center: [28.6139, 77.2093] as [number, number], status: 'online' as const },
  { id: 'd3', name: 'Gateway-B1', center: [28.6134, 77.2081] as [number, number], status: 'warning' as const },
  { id: 'd4', name: 'Helmet-RFID', center: [28.6131, 77.2099] as [number, number], status: 'offline' as const },
];

function getZoneColor(risk: number): string {
  if (risk >= 0.7) return '#ef4444';
  if (risk >= 0.45) return '#f97316';
  if (risk >= 0.2) return '#eab308';
  return '#22c55e';
}

function MapLayers() {
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {zones.map((zone) => (
        <Circle
          key={zone.name}
          center={zone.center}
          radius={30}
          pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.15, weight: 2 }}
        />
      ))}
      {zones.map((zone) => (
        <Marker key={`label-${zone.name}`} position={[zone.center[0] + 0.0015, zone.center[1]]} icon={iconSafeZone}>
          <Popup>
            <div className="text-xs font-medium">{zone.name}</div>
            <div className="text-[10px]">Risk: {Math.round(zone.risk * 100)}%</div>
            <div className="text-[10px]">Workers: {zone.workers}</div>
          </Popup>
        </Marker>
      ))}
      {workers.map((w) => (
        <Marker
          key={w.id}
          position={w.center}
          icon={w.risk === 'critical' || w.risk === 'high_risk' ? iconWarning : iconPerson}
        >
          <Popup>
            <div className="text-xs font-medium">{w.name}</div>
            <div className="text-[10px]">Zone: {w.zone}</div>
            <div className="text-[10px]">Risk: {w.risk}</div>
          </Popup>
        </Marker>
      ))}
      {devices.map((d) => (
        <Marker
          key={d.id}
          position={d.center}
          icon={new L.DivIcon({
            className: 'bg-transparent',
            html: `<div style="background:${d.status === 'online' ? '#22c55e' : d.status === 'warning' ? '#eab308' : '#6b7280'};border:2px solid white;border-radius:4px;width:8px;height:8px;"></div>`,
            iconSize: [8, 8],
            iconAnchor: [4, 4],
          })}
        >
          <Popup>
            <div className="text-xs font-medium">{d.name}</div>
            <div className="text-[10px]">Status: {d.status}</div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export function MapView() {
  const [activeLayer, setActiveLayer] = useState<'risk' | 'workers' | 'devices'>('risk');
  const [mapKey, setMapKey] = useState(0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Factory Map</h2>
          <p className="text-muted-foreground">Interactive factory floor with real-time worker locations and risk zones</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setMapKey(k => k + 1)}>
          <Maximize2 className="mr-2 h-4 w-4" /> Reset View
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-blue-400" /> Workers on site</div>
            <p className="text-2xl font-bold">{workers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4 text-red-400" /> High risk zones</div>
            <p className="text-2xl font-bold">{zones.filter(z => z.risk >= 0.7).length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Factory className="h-4 w-4 text-emerald-400" /> Active zones</div>
            <p className="text-2xl font-bold">{zones.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Layers className="h-4 w-4 text-purple-400" /> Devices</div>
            <p className="text-2xl font-bold">{devices.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {(['risk', 'workers', 'devices'] as const).map((layer) => (
          <Button key={layer} variant={activeLayer === layer ? 'default' : 'outline'} size="sm" onClick={() => setActiveLayer(layer)}>
            {layer === 'risk' && <Crosshair className="mr-1 h-4 w-4" />}
            {layer === 'workers' && <Users className="mr-1 h-4 w-4" />}
            {layer === 'devices' && <MapPin className="mr-1 h-4 w-4" />}
            {layer.charAt(0).toUpperCase() + layer.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0 h-[600px]">
          <MapContainer key={mapKey} center={defaultCenter} zoom={16} className="h-full w-full" zoomControl={false}>
            <MapLayers />
          </MapContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Zone Risk Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {zones.sort((a, b) => b.risk - a.risk).map((zone) => (
                <div key={zone.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: getZoneColor(zone.risk) }} />
                    <span>{zone.name}</span>
                  </div>
                  <Badge className={zone.risk >= 0.7 ? 'bg-red-500/20 text-red-400' : zone.risk >= 0.45 ? 'bg-orange-500/20 text-orange-400' : zone.risk >= 0.2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}>
                    {Math.round(zone.risk * 100)}% risk
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Worker Locations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workers.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${w.risk === 'critical' || w.risk === 'high_risk' ? 'bg-red-500' : w.risk === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span>{w.name}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{w.zone}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Device Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${d.status === 'online' ? 'bg-green-500' : d.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                    <span>{d.name}</span>
                  </div>
                  <Badge className={d.status === 'online' ? 'bg-green-500/20 text-green-400' : d.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}>
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
