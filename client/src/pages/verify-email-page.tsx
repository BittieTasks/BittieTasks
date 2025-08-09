import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function VerifyEmailPage() {
  const [location] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in URL');
      return;
    }

    // Verify the email token
    const verifyEmail = async () => {
      try {
        const response = await apiRequest('GET', `/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, []);

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