import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { GradientFillButton } from '@/components/GradientFillButton';
import logo from '@/assets/logo.png';

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (isSignUp) {
      const result = signupSchema.safeParse({ fullName, email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setIsLoading(true);
      const { error } = await signUp(email, password, fullName);
      setIsLoading(false);

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            variant: 'destructive',
            title: 'Account exists',
            description: 'An account with this email already exists. Please login instead.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Signup failed',
            description: error.message,
          });
        }
      } else {
        toast({
          title: 'Welcome!',
          description: 'Your account has been created.',
        });
      }
    } else {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setIsLoading(true);
      const { error } = await signIn(email, password);
      setIsLoading(false);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid email or password.',
        });
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFullName('');
    setEmail('');
    setPassword('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050d18' }}>
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#050d18' }}>
      {/* Logo */}
      <a href="/" className="mb-12">
        <img src={logo} alt="Design Rocket" className="h-10" />
      </a>
      
      {/* Form Container */}
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-foreground text-center mb-2">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          {isSignUp ? 'Start your journey with Design Rocket' : 'Sign in to continue learning'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 bg-[#0a1422] border-border/30 focus:border-primary/50 placeholder:text-muted-foreground/50"
              />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
            </div>
          )}
          
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-[#0a1422] border-border/30 focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-[#0a1422] border-border/30 focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>
          
          <GradientFillButton 
            as="button"
            type="submit" 
            fullWidth
            disabled={isLoading}
            loading={isLoading}
          >
            {isSignUp ? 'Create account' : 'Sign in'}
          </GradientFillButton>
        </form>
        
        <p className="text-center text-muted-foreground text-sm mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={toggleMode}
            className="text-primary hover:underline font-medium"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
