import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import heroImage from '@/assets/hero-rwanda.jpg';

const ForgotPasswordForm = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
      toast({ title: 'Check your email', description: 'We sent you a password reset link.' });
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        <h2 className="font-display text-xl font-bold text-foreground">Email Sent!</h2>
        <p className="font-body text-sm text-muted-foreground">Check your inbox for a password reset link.</p>
        <Button variant="outline" onClick={onBack} className="font-body">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="font-body text-sm font-medium">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="you@example.com"
            className="pl-10 font-body"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-navy text-white border-0 font-body font-semibold h-11" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Send Reset Link
      </Button>
      <p className="text-center font-body text-sm text-muted-foreground">
        <button type="button" onClick={onBack} className="text-primary hover:text-accent font-medium flex items-center gap-1 justify-center w-full">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </button>
      </p>
    </form>
  );
};

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface FormErrors {
  email?: string;
  password?: string;
  full_name?: string;
}

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    full_name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!form.full_name) {
        newErrors.full_name = 'Full name is required';
      } else if (form.full_name.length < 2) {
        newErrors.full_name = 'Name must be at least 2 characters';
      }

      if (form.password !== form.confirmPassword) {
        newErrors.password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { error } = await signIn(form.email, form.password);
      
      if (error) {
        let errorMessage = 'Login failed';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email to confirm your account';
        }
        toast({ 
          title: 'Login failed', 
          description: errorMessage, 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Welcome back!', 
          description: 'Taking you to your dashboard...' 
        });
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({ 
        title: 'Login failed', 
        description: 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { error } = await signUp(form.email, form.password, form.full_name);
      
      if (error) {
        let errorMessage = 'Registration failed';
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'Password must be at least 6 characters';
        }
        toast({ 
          title: 'Registration failed', 
          description: errorMessage, 
          variant: 'destructive' 
        });
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
        setMode('login');
        setForm({ full_name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast({ 
        title: 'Registration failed', 
        description: 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      
      if (error) {
        toast({ 
          title: 'Sign in failed', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast({ 
        title: 'Sign in failed', 
        description: 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroImage} alt="Rwanda" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-12">
          <div className="glass rounded-3xl p-8 max-w-sm">
            <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold">
              <span className="text-navy font-display font-bold text-2xl">E</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">ESA Tours</h2>
            <p className="font-body text-white/70 text-sm leading-relaxed">
              Your gateway to extraordinary African experiences. Discover Rwanda and beyond with the region's premier tourism company.
            </p>
            <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
              {[['2,500+', 'Travelers'], ['50+', 'Packages'], ['10+', 'Years']].map(([val, label]) => (
                <div key={label}>
                  <div className="font-display font-bold text-gold text-lg">{val}</div>
                  <div className="font-body text-white/60 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-background">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-navy font-display font-bold">E</span>
            </div>
            <span className="font-display font-bold text-foreground">ESA Tours</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="gold-divider mb-4" />
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="font-body text-muted-foreground text-sm">
                {mode === 'login' ? 'Sign in to manage your bookings' : 'Join thousands of ESA Tours travelers'}
              </p>
            </div>

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email" 
                      name="email" 
                      placeholder="you@example.com"
                      className={`pl-10 font-body ${errors.email ? 'border-red-500' : ''}`}
                      value={form.email} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs font-body">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-body text-sm font-medium">Password</Label>
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot')} 
                      className="text-xs text-primary hover:text-accent font-body transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'} 
                      name="password"
                      placeholder="••••••••" 
                      className={`pl-10 pr-10 font-body ${errors.password ? 'border-red-500' : ''}`}
                      value={form.password} 
                      onChange={handleChange} 
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs font-body">{errors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-navy text-white border-0 font-body font-semibold h-11" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 font-body"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span className="ml-2">Continue with Google</span>
                </Button>
                
                <p className="text-center font-body text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setMode('register')} 
                    className="text-primary hover:text-accent font-medium transition-colors"
                  >
                    Register here
                  </button>
                </p>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="text" 
                      name="full_name" 
                      placeholder="John Doe" 
                      className={`pl-10 font-body ${errors.full_name ? 'border-red-500' : ''}`}
                      value={form.full_name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-red-500 text-xs font-body">{errors.full_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      name="email" 
                      placeholder="you@example.com" 
                      className={`pl-10 font-body ${errors.email ? 'border-red-500' : ''}`}
                      value={form.email} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs font-body">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'} 
                      name="password"
                      placeholder="Min. 6 characters" 
                      className={`pl-10 pr-10 font-body ${errors.password ? 'border-red-500' : ''}`}
                      value={form.password} 
                      onChange={handleChange} 
                      required 
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs font-body">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'} 
                      name="confirmPassword"
                      placeholder="Confirm your password" 
                      className="pl-10 pr-10 font-body"
                      value={form.confirmPassword} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gold text-navy border-0 font-body font-semibold h-11" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 font-body"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span className="ml-2">Continue with Google</span>
                </Button>
                
                <p className="text-center font-body text-xs text-muted-foreground">
                  By registering, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
                
                <p className="text-center font-body text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setMode('login')} 
                    className="text-primary hover:text-accent font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {mode === 'forgot' && (
              <ForgotPasswordForm onBack={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
