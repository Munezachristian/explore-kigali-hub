import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-rwanda.jpg';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      navigate('/');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });
      setMode('login');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email sent!', description: 'Check your inbox for the reset link.' });
      setMode('login');
    }
    setLoading(false);
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
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
              </h1>
              <p className="font-body text-muted-foreground text-sm">
                {mode === 'login' ? 'Sign in to manage your bookings' : mode === 'register' ? 'Join thousands of ESA Tours travelers' : 'Enter your email to receive a reset link'}
              </p>
            </div>

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email" name="email" placeholder="you@example.com"
                      className="pl-10 font-body" value={form.email} onChange={handleChange} required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-body text-sm font-medium">Password</Label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:text-accent font-body transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'} name="password"
                      placeholder="••••••••" className="pl-10 pr-10 font-body"
                      value={form.password} onChange={handleChange} required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-navy text-white border-0 font-body font-semibold h-11" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
                <p className="text-center font-body text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setMode('register')} className="text-primary hover:text-accent font-medium transition-colors">
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
                    <Input type="text" name="full_name" placeholder="John Doe" className="pl-10 font-body" value={form.full_name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" name="email" placeholder="you@example.com" className="pl-10 font-body" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'} name="password"
                      placeholder="Min. 6 characters" className="pl-10 pr-10 font-body"
                      value={form.password} onChange={handleChange} required minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-gold text-navy border-0 font-body font-semibold h-11" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
                <p className="text-center font-body text-xs text-muted-foreground">
                  By registering, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
                <p className="text-center font-body text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('login')} className="text-primary hover:text-accent font-medium transition-colors">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" name="email" placeholder="you@example.com" className="pl-10 font-body" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-navy text-white border-0 font-body font-semibold h-11" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
                <p className="text-center font-body text-sm text-muted-foreground">
                  <button type="button" onClick={() => setMode('login')} className="text-primary hover:text-accent font-medium transition-colors flex items-center gap-1 mx-auto">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
