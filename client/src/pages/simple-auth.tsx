import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SimpleAuth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 Attempting sign in with:', email);
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        console.error('🔐 Sign in error:', error);
        toast({
          title: "Sign In Failed",
          description: `${error.message} (Code: ${error.status || 'Unknown'})`,
          variant: "destructive",
        });
      } else {
        console.log('🔐 Sign in successful:', data);
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      }
    } catch (error: any) {
      console.error('🔐 Sign in exception:', error);
      toast({
        title: "Connection Error",
        description: `Failed to connect: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 Attempting sign up with:', email);
      const { data, error } = await signUpWithEmail(email, password);
      
      if (error) {
        console.error('🔐 Sign up error:', error);
        toast({
          title: "Sign Up Failed",
          description: `${error.message} (Code: ${error.status || 'Unknown'})`,
          variant: "destructive",
        });
      } else {
        console.log('🔐 Sign up successful:', data);
        toast({
          title: "Check your email!",
          description: "We've sent you a verification link.",
        });
      }
    } catch (error: any) {
      console.error('🔐 Sign up exception:', error);
      toast({
        title: "Connection Error",
        description: `Failed to connect: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">BittieTasks</CardTitle>
          <CardDescription>Sign in to start earning or create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}