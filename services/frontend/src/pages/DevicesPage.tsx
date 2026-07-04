import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Search, Cpu, Wifi, Battery, BatteryWarning } from 'lucide-react';

interface DeviceData {
  _id: string;
  name: string;
  serialNumber: string;
  type: string;
  status: string;
  batteryLevel?: number;
  firmware: { version: string };
  isActive: boolean;
}

const typeIcons: Record<string, string> = {
  esp32: 'ESP32',
  raspberry_pi: 'RPi',
  jetson_nano: 'Jetson',
  camera: 'Camera',
  smart_helmet: 'Helmet',
  wearable: 'Wearable',
};

export function DevicesPage() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices() {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/v1/devices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDevices(data.data?.devices || []);
    } catch (err) {
      console.error('Failed to load devices', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = devices.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Devices</h2>
          <p className="text-muted-foreground">Manage IoT devices, wearables, and sensors</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Register Device
        </Button>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, serial, or type..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No devices found</p>
        ) : (
          filtered.map((device) => (
            <Card key={device._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                  </div>
                  <Badge
                    variant={
                      device.status === 'online'
                        ? 'default'
                        : device.status === 'offline'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {device.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {typeIcons[device.type] || device.type} • {device.serialNumber}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <span>Firmware: v{device.firmware?.version || 'N/A'}</span>
                  </div>
                  {device.batteryLevel !== undefined && (
                    <div className="flex items-center gap-2">
                      {device.batteryLevel > 20 ? (
                        <Battery className="h-4 w-4 text-green-600" />
                      ) : (
                        <BatteryWarning className="h-4 w-4 text-red-600" />
                      )}
                      <span>{device.batteryLevel}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
