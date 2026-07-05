import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { useToast } from '../components/ui/toast';
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Lock, User, Building, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  institution?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (institution.trim() && institution.trim().length < 2) {
      newErrors.institution = 'Institution name must be at least 2 characters if provided';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and a number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        institution: institution.trim() || undefined,
      });
      toast({
        title: 'Account created!',
        description: 'Welcome to StudyRoom. Start your study journey.',
        variant: 'success',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setServerError(message);
      toast({ title: 'Registration failed', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-indigo-500/10 blur-[120px] delay-1000" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] animate-pulse rounded-full bg-purple-500/5 blur-[100px] delay-500" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="relative border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-2xl dark:bg-black/20">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25"
            >
              <GraduationCap className="h-7 w-7 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Create your account
            </CardTitle>
            <CardDescription className="text-slate-400">
              Join StudyRoom and collaborate with peers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {serverError}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    First name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoComplete="given-name"
                      className={cn(
                        'border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20',
                        errors.firstName && 'border-red-500/50',
                      )}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-red-400">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Last name
                  </label>
                  <Input
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    className={cn(
                      'border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20',
                      errors.lastName && 'border-red-500/50',
                    )}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={cn(
                      'border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20',
                      errors.email && 'border-red-500/50',
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Institution <span className="text-slate-600">(optional)</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    placeholder="e.g. MIT, Stanford"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    autoComplete="organization"
                    className={cn(
                      'border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20',
                      errors.institution && 'border-red-500/50',
                    )}
                  />
                </div>
                {errors.institution && (
                  <p className="text-xs text-red-400">{errors.institution}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={cn(
                      'border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20',
                      errors.password && 'border-red-500/50',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={cn(
                      'border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20',
                      errors.confirmPassword && 'border-red-500/50',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setAcceptedTerms(!acceptedTerms)}
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                      acceptedTerms
                        ? 'border-blue-500 bg-blue-600'
                        : 'border-white/20 bg-white/5',
                      errors.terms && 'border-red-500/50',
                    )}
                  >
                    {acceptedTerms && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <span className="text-sm text-slate-400">
                    I accept the{' '}
                    <a href="/terms" className="text-blue-400 underline transition-colors hover:text-blue-300">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-400 underline transition-colors hover:text-blue-300">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-red-400">{errors.terms}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2 border-t border-white/10 pt-6">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-400 transition-colors hover:text-blue-300">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-slate-600">
              &copy; 2026 StudyRoom. All rights reserved.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
