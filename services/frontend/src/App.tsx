import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveDashboardPage } from './pages/LiveDashboardPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { SafetyOfficerDashboard } from './pages/SafetyOfficerDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { IncidentsPage } from './pages/IncidentsPage';
import { WorkersPage } from './pages/WorkersPage';
import { FactoriesPage } from './pages/FactoriesPage';
import { DevicesPage } from './pages/DevicesPage';
import { MapView } from './pages/MapView';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ComplianceDashboard } from './pages/ComplianceDashboard';
import { PredictiveMaintenance } from './pages/PredictiveMaintenance';
import { ReportsPage } from './pages/ReportsPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import type { UserRole } from './types';

const roleDashboard: Record<UserRole, string> = {
  admin: '/admin',
  supervisor: '/supervisor',
  safety_officer: '/safety-officer',
  worker: '/worker',
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={roleDashboard[user.role] || '/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/live" element={<LiveDashboardPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/supervisor" element={<SupervisorDashboard />} />
        <Route path="/safety-officer" element={<SafetyOfficerDashboard />} />
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/workers" element={<WorkersPage />} />
        <Route path="/factories" element={<FactoriesPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/compliance" element={<ComplianceDashboard />} />
        <Route path="/maintenance" element={<PredictiveMaintenance />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route
        path="*"
        element={
          isAuthenticated && user ? (
            <Navigate to={roleDashboard[user.role] || '/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
