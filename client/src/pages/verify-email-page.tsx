import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        console.log('Current URL:', window.location.href);
        console.log('URL search:', window.location.search);
        console.log('URL hash:', window.location.hash);
        
        // Check if this is a Supabase email verification callback
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const access_token = urlParams.get('access_token') || hashParams.get('access_token');
        const refresh_token = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = urlParams.get('type') || hashParams.get('type');
        const error_description = urlParams.get('error_description') || hashParams.get('error_description');
        
        console.log('Parsed tokens:', { access_token: !!access_token, refresh_token: !!refresh_token, type, error_description });

        // Handle verification error
        if (error_description) {
          setStatus('error');
          setMessage(`Verification failed: ${error_description}`);
          return;
        }

        // Handle verification success with tokens
        if (access_token && type === 'signup') {
          console.log('Setting session with tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token || '',
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('error');
            setMessage(`Session error: ${error.message}`);
            return;
          }

          if (data.session?.user) {
            console.log('User verified successfully:', data.session.user.email);
            setStatus('success');
            setMessage('Your email has been successfully verified! Redirecting...');
            
            // Redirect to home after a short delay
            setTimeout(() => {
              setLocation('/');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Session created but no user found');
          }
        } else if (user?.email_confirmed_at) {
          // User is already verified
          setStatus('success');
          setMessage('Your email is already verified!');
          setTimeout(() => {
            setLocation('/');
          }, 2000);
        } else if (!access_token && !user) {
          // No tokens and no user - might be a direct visit
          setStatus('error');
          setMessage('No verification information found. Please check your email for the verification link.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    // Wait for auth to load, then handle verification
    if (!loading) {
      handleEmailVerification();
    }
  }, [user, loading, setLocation]);

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
      <div className="px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              {status === 'loading' && <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-8 h-8 text-green-600" />}
              {status === 'error' && <XCircle className="w-8 h-8 text-red-600" />}
            </div>
            <CardTitle className="text-xl">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'success' && (
              <div className="space-y-3">
                <p className="text-center text-gray-600">
                  Your email has been successfully verified. You can now log in to start earning!
                </p>
                <Link href="/auth">
                  <Button className="w-full">
                    Log In Now
                  </Button>
                </Link>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-3">
                <p className="text-center text-gray-600">
                  Don't worry! You can request a new verification email.
                </p>
                <Link href="/resend-verification">
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
            
            {status === 'loading' && (
              <p className="text-center text-gray-600">
                Please wait while we verify your email address...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}