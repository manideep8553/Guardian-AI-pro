import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department,
        employeeId: form.employeeId,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-background p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <Card className="relative w-full max-w-lg border-border bg-card shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join the GuardianAI safety ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First name</label>
                <Input name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last name</label>
                <Input name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department</label>
                <Input name="department" placeholder="Safety" value={form.department} onChange={handleChange} required
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Employee ID</label>
                <Input name="employeeId" placeholder="EMP001" value={form.employeeId} onChange={handleChange} required
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 chars" value={form.password} onChange={handleChange} required minLength={8}
                    className="border-border bg-background pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm</label>
                <Input name="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required minLength={8}
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
