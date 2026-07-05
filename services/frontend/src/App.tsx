import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudyRoomsPage } from './pages/StudyRoomsPage';
import { CodeEditorPage } from './pages/CodeEditorPage';
import { WhiteboardPage } from './pages/WhiteboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { CalendarPage } from './pages/CalendarPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from './components/ui/toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your study space...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your study space...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />}
        />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/study-rooms" element={<StudyRoomsPage />} />
          <Route path="/code-editor" element={<CodeEditorPage />} />
          <Route path="/whiteboard" element={<WhiteboardPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}
