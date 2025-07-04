
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { PasswordResetForm } from './PasswordResetForm';
import { MagicLinkForm } from './MagicLinkForm';

type LoginView = 'login' | 'reset' | 'magic';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<LoginView>('login');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email.endsWith('@thecouragehouse.org')) {
      toast({
        title: 'Access Denied',
        description: 'Only @thecouragehouse.org email addresses are allowed.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome!',
        description: 'Successfully logged in to admin panel.',
      });
    }
    
    setLoading(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'reset':
        return <PasswordResetForm onBack={() => setCurrentView('login')} />;
      case 'magic':
        return <MagicLinkForm onBack={() => setCurrentView('login')} />;
      default:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Admin Panel Login</CardTitle>
              <CardDescription>
                Please sign in with your @thecouragehouse.org account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@thecouragehouse.org"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <div className="flex flex-col space-y-2 pt-4">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-sm"
                  >
                    <a href="https://avyo-signup.netlify.app/password-reset">Forgot your password?</a>
                  </Button>
                  {/* <Button 
                    type="button" 
                    variant="link" 
                    onClick={() => setCurrentView('magic')}
                    className="text-sm"
                  >
                    Sign in with magic link
                  </Button> */}
                </div>
              </form>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {renderCurrentView()}
    </div>
  );
};
