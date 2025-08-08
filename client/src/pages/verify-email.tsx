import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function VerifyEmailPage() {
  const [location, setLocation] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    // Verify the email token
    const verifyEmail = async () => {
      try {
        const response = await apiRequest('GET', `/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (data.verified) {
          setVerificationStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setVerificationStatus('error');
          setMessage(data.message || 'Verification link expired. Please request a new verification email from the signup page.');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('Verification link expired. Please go to the signup page and request a new verification email.');
      }
    };

    verifyEmail();
  }, []);

  const handleContinue = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {verificationStatus === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <CardTitle>
            {verificationStatus === 'loading' && 'Verifying Your Email'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {verificationStatus === 'loading' && 'Please wait while we verify your email address...'}
            {verificationStatus === 'success' && 'Your account has been activated successfully.'}
            {verificationStatus === 'error' && 'There was an issue with your email verification.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            {message}
          </div>

          {verificationStatus === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">🎉 Welcome to BittieTasks!</h3>
                <p className="text-sm text-green-700">
                  You can now create tasks, join activities, and start earning money from everyday household tasks.
                </p>
              </div>
              <Button onClick={handleContinue} className="w-full">
                Continue to BittieTasks
              </Button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">Need Help?</h3>
                <p className="text-sm text-red-700 mb-3">
                  Try signing up again with a valid email address, or contact support if you continue having issues.
                </p>
                <div className="flex items-center text-sm text-red-600">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>support@bittietasks.com</span>
                </div>
              </div>
              <Button onClick={handleContinue} variant="outline" className="w-full">
                Back to Homepage
              </Button>
            </div>
          )}

          {verificationStatus === 'loading' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                This usually takes just a few seconds. Please don't close this page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}