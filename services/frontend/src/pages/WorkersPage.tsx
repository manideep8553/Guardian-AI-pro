import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Search, HardHat, QrCode, Shield } from 'lucide-react';

interface Worker {
  _id: string;
  employeeId: string;
  designation: string;
  department?: { name: string };
  isActive: boolean;
  userId?: { firstName: string; lastName: string; email: string };
  rfidTag?: string;
  digitalIdQR?: string;
}

export function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/v1/workers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWorkers(data.data?.workers || []);
    } catch (err) {
      console.error('Failed to load workers', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = workers.filter((w) =>
    w.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    w.designation.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workers</h2>
          <p className="text-muted-foreground">Employee management and workforce tracking</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by employee ID or designation..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Workers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">No workers found</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((worker) => (
                <div
                  key={worker._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <HardHat className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {worker.userId?.firstName} {worker.userId?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {worker.employeeId} • {worker.designation}
                      </p>
                      {worker.department && (
                        <p className="text-xs text-muted-foreground">{worker.department.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {worker.rfidTag && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        RFID
                      </Badge>
                    )}
                    {worker.digitalIdQR && (
                      <Badge variant="outline" className="gap-1">
                        <QrCode className="h-3 w-3" />
                        QR
                      </Badge>
                    )}
                    <Badge variant={worker.isActive ? 'default' : 'secondary'}>
                      {worker.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
