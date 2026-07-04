import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertTriangle, CheckCircle, Users, Activity } from 'lucide-react';

const stats = [
  { title: 'Active Incidents', value: '12', icon: AlertTriangle, color: 'text-red-600' },
  { title: 'Resolved Today', value: '8', icon: CheckCircle, color: 'text-green-600' },
  { title: 'Team Members', value: '24', icon: Users, color: 'text-blue-600' },
  { title: 'Risk Score', value: 'Low', icon: Activity, color: 'text-yellow-600' },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Real-time safety overview and key metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
