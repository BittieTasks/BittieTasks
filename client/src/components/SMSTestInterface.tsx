import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Shield, CreditCard, Bell, CheckCircle } from 'lucide-react';

interface SMSStatus {
  smsEnabled: boolean;
  fromNumber: string | null;
  features: string[];
}

export default function SMSTestInterface() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<SMSStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/sms/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch SMS status:', err);
    }
  };

  const sendTestSMS = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await fetch('/api/sms/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Test SMS sent successfully! Check your phone.'
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to send SMS'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to send test SMS'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationTest = async (type: string, data: any) => {
    setLoading(true);
    setError('');
    setTestResult(null);

    try {
      let endpoint = '';
      let payload = { phoneNumber, ...data };

      switch (type) {
        case 'task':
          endpoint = '/api/sms/task-notification';
          break;
        case 'payment':
          endpoint = '/api/sms/payment-notification';
          break;
        case 'security':
          endpoint = '/api/sms/security-alert';
          break;
        case 'verification':
          endpoint = '/api/sms/verify';
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      setTestResult({
        success: result.success,
        message: result.success ? 'Notification sent successfully!' : result.error
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to send notification'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            SMS Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Service Status:</span>
                <Badge className={getStatusColor(status.smsEnabled)}>
                  {status.smsEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              {status.fromNumber && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">From Number:</span>
                  <span className="font-mono text-sm">{status.fromNumber}</span>
                </div>
              )}
              
              <div>
                <span className="font-medium">Available Features:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {status.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading status...</p>
          )}
        </CardContent>
      </Card>

      {/* Test Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-500" />
            SMS Testing Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number (for testing)
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890 or 1234567890"
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your phone number to receive test notifications
            </p>
          </div>

          <Button 
            onClick={sendTestSMS} 
            disabled={loading || !phoneNumber || !status?.smsEnabled}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Test SMS'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-orange-500" />
              Task Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => sendNotificationTest('task', {
                taskTitle: 'Test House Cleaning',
                status: 'completed'
              })}
              disabled={loading || !phoneNumber || !status?.smsEnabled}
              variant="outline"
              className="w-full"
            >
              Test Task Update
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-green-500" />
              Payment Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => sendNotificationTest('payment', {
                amount: 45,
                type: 'received'
              })}
              disabled={loading || !phoneNumber || !status?.smsEnabled}
              variant="outline"
              className="w-full"
            >
              Test Payment Alert
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-red-500" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => sendNotificationTest('security', {
                alertType: 'Login from new device detected'
              })}
              disabled={loading || !phoneNumber || !status?.smsEnabled}
              variant="outline"
              className="w-full"
            >
              Test Security Alert
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => sendNotificationTest('verification', {
                code: '123456'
              })}
              disabled={loading || !phoneNumber || !status?.smsEnabled}
              variant="outline"
              className="w-full"
            >
              Test Verification Code
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Notification Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Automatic Notifications:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Task status updates</li>
                <li>• Payment confirmations</li>
                <li>• Security alerts</li>
                <li>• Account verification</li>
                <li>• Task reminders</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Smart Features:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Phone number formatting</li>
                <li>• Delivery confirmation</li>
                <li>• Error handling & retries</li>
                <li>• Rate limiting protection</li>
                <li>• STOP/unsubscribe support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}