import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useScreenEffects } from '@/hooks/useScreenEffects';
import authBg from '@/assets/auth-bg.png';

// Validation schemas
const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" }).max(72);

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading, authError, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showFlicker, showFrameJump } = useScreenEffects();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const validateForm = (): boolean => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Invalid input",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          // Handle specific error cases
          if (error.message.includes('already registered')) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Try signing in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome!",
            description: "Account created successfully.",
          });
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          navigate('/');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="font-vhs text-muted-foreground animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background Image with VHS Effects */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat projector-pulse ${showFrameJump ? 'frame-jump' : ''}`}
        style={{ backgroundImage: `url(${authBg})` }}
      />
      
      {/* Screen Flicker Overlay */}
      {showFlicker && (
        <div className="absolute inset-0 bg-white/10 screen-flicker pointer-events-none z-10" />
      )}
      
      {/* Film Grain Overlay */}
      <div className="film-grain absolute inset-0 pointer-events-none" />
      
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines-overlay" />
      
      {/* Vignette */}
      <div className="vignette absolute inset-0 pointer-events-none" />

      {/* Auth Form - positioned to the right */}
      <div className="relative z-20 w-full max-w-sm mx-4 sm:mr-[10%] sm:ml-auto">
        <div className="bg-black/70 backdrop-blur-sm border border-primary/30 rounded-sm p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 
              className="font-display text-2xl sm:text-3xl text-primary blood-glow tracking-wider"
            >
              {user ? 'SIGNED IN' : (isSignUp ? 'JOIN THE CAST' : 'WELCOME BACK')}
            </h1>
            <p className="type-caption text-muted-foreground mt-2">
              {user ? user.email : (isSignUp ? 'CREATE YOUR ACCOUNT' : 'SIGN IN TO CONTINUE')}
            </p>
          </div>

          {authError && (
            <div className="mb-5 border border-primary/30 bg-background/70 px-3 py-2 text-center">
              <p className="type-caption text-primary">SIGN-IN TEMPORARILY UNAVAILABLE</p>
              <p className="mt-1 type-caption text-muted-foreground">{authError}</p>
            </div>
          )}

          {user ? (
            // Logged in state
            <div className="space-y-4">
              <Button
                onClick={handleSignOut}
                disabled={isSubmitting}
                className="w-full type-label uppercase bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30"
              >
                {isSubmitting ? 'SIGNING OUT...' : 'SIGN OUT'}
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full type-caption text-muted-foreground hover:text-foreground"
              >
                ← BACK TO MAIN
              </Button>
            </div>
          ) : (
            // Sign in/up forms
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Google Sign In */}
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full bg-white text-black hover:bg-gray-100 font-sans text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/30" />
                </div>
                <div className="relative flex justify-center type-caption">
                  <span className="bg-black/70 px-2 font-vhs text-muted-foreground">OR</span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="type-caption text-foreground/80">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="final.girl@example.com"
                  required
                  className="bg-black/50 border-muted-foreground/30 focus:border-primary font-sans text-sm"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="type-caption text-foreground/80">
                  PASSWORD
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-black/50 border-muted-foreground/30 focus:border-primary font-sans text-sm"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full type-label uppercase bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30"
              >
                {isSubmitting ? 'PLEASE WAIT...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
              </Button>

              {/* Toggle Sign In/Up */}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full type-caption text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {isSignUp ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : "DON'T HAVE AN ACCOUNT? SIGN UP"}
              </button>
            </form>
          )}

          {/* Back Link */}
          {!user && (
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 type-caption text-dim hover:text-foreground transition-colors"
            >
              ← CONTINUE AS GUEST
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
