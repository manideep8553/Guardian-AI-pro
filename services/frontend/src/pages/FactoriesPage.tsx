import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Search, Factory, Building2, MapPin } from 'lucide-react';

interface FactoryData {
  _id: string;
  name: string;
  code: string;
  address: { city: string; state: string; country: string };
  contactPhone: string;
  contactEmail: string;
  totalBuildings: number;
  totalWorkers: number;
  isActive: boolean;
}

export function FactoriesPage() {
  const [factories, setFactories] = useState<FactoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFactories();
  }, []);

  async function fetchFactories() {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/v1/factories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFactories(data.data?.factories || []);
    } catch (err) {
      console.error('Failed to load factories', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = factories.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Factories</h2>
          <p className="text-muted-foreground">Manage factory locations, buildings, and zones</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Factory
        </Button>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search factories..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No factories found</p>
        ) : (
          filtered.map((factory) => (
            <Card key={factory._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Factory className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{factory.name}</CardTitle>
                  </div>
                  <Badge variant={factory.isActive ? 'default' : 'secondary'}>
                    {factory.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Code: {factory.code}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {factory.address.city}, {factory.address.state}, {factory.address.country}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {factory.totalBuildings} Buildings • {factory.totalWorkers} Workers
                  </div>
                  <p className="text-muted-foreground">{factory.contactEmail}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
