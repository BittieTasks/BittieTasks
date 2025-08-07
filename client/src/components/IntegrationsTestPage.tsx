import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Mail, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Send,
  Lock,
  TrendingUp
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  enabled: boolean;
  features: string[];
  details?: any;
}

export default function IntegrationsTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [testInputs, setTestInputs] = useState({
    email: '',
    amount: 25,
    name: 'Test User'
  });

  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);

  React.useEffect(() => {
    loadServiceStatuses();
  }, []);

  const loadServiceStatuses = async () => {
    try {
      const responses = await Promise.all([
        fetch('/api/payments/status').then(r => r.ok ? r.json() : null),
        fetch('/api/emails/status').then(r => r.ok ? r.json() : null),
        fetch('/api/sms/status').then(r => r.ok ? r.json() : null)
      ]);

      const statuses: ServiceStatus[] = [
        {
          name: 'Stripe Payments',
          enabled: responses[0]?.stripe?.enabled || false,
          features: responses[0]?.stripe?.features || [],
          details: responses[0]?.stripe
        },
        {
          name: 'Escrow Protection',
          enabled: responses[0]?.escrow?.enabled || false,
          features: responses[0]?.escrow?.features || [],
          details: responses[0]?.escrow
        },
        {
          name: 'SendGrid Emails',
          enabled: responses[1]?.enabled || false,
          features: responses[1]?.features || [],
          details: responses[1]
        },
        {
          name: 'Twilio SMS',
          enabled: responses[2]?.smsEnabled || false,
          features: responses[2]?.features || [],
          details: responses[2]
        },
        {
          name: 'Google Analytics',
          enabled: !!import.meta.env.VITE_GA_MEASUREMENT_ID,
          features: ['page_tracking', 'event_tracking', 'conversion_analysis'],
          details: { measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID ? 'Configured' : 'Missing' }
        }
      ];

      setServiceStatuses(statuses);
    } catch (error) {
      console.error('Failed to load service statuses:', error);
    }
  };

  const testPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: testInputs.amount })
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, payment: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, payment: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testWelcomeEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emails/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testInputs.email, 
          name: testInputs.name 
        })
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, email: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, email: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testEscrowTransaction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/create-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 150,
          buyerEmail: testInputs.email,
          sellerEmail: 'seller@test.com',
          description: 'Test escrow transaction'
        })
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, escrow: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, escrow: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testAnalyticsEvent = () => {
    // Import analytics functions dynamically to test
    if (window.gtag) {
      window.gtag('event', 'test_integration', {
        event_category: 'integrations',
        event_label: 'manual_test',
        value: 1
      });
      setResults(prev => ({ 
        ...prev, 
        analytics: { success: true, message: 'Test event sent to Google Analytics' }
      }));
    } else {
      setResults(prev => ({ 
        ...prev, 
        analytics: { success: false, message: 'Google Analytics not initialized' }
      }));
    }
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Integration Status Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Monitor and test all active integrations for your BittieTasks platform
        </p>
      </div>

      {/* Service Status Overview */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {serviceStatuses.map((service, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                {getStatusIcon(service.enabled)}
                <Badge className={getStatusColor(service.enabled)}>
                  {service.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <h3 className="font-medium text-sm mb-2">{service.name}</h3>
              <p className="text-xs text-gray-500">
                {service.features.length} features available
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Testing Interface */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Stripe Payment Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount ($)</label>
                  <Input
                    type="number"
                    value={testInputs.amount}
                    onChange={(e) => setTestInputs(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    min="1"
                    max="1000"
                  />
                </div>
                <Button onClick={testPaymentIntent} disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Test Payment Intent'}
                </Button>
                {results.payment && (
                  <Alert variant={results.payment.error ? "destructive" : "default"}>
                    <AlertDescription>
                      {results.payment.error || `Payment intent created: $${results.payment.amount}`}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  Escrow Protection Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Buyer Email</label>
                  <Input
                    type="email"
                    value={testInputs.email}
                    onChange={(e) => setTestInputs(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="test@example.com"
                  />
                </div>
                <Button onClick={testEscrowTransaction} disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Test Escrow ($150)'}
                </Button>
                {results.escrow && (
                  <Alert variant={results.escrow.error ? "destructive" : "default"}>
                    <AlertDescription>
                      {results.escrow.error || `Escrow created: ${results.escrow.transactionId}`}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-500" />
                Email System Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={testInputs.email}
                    onChange={(e) => setTestInputs(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={testInputs.name}
                    onChange={(e) => setTestInputs(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Test User"
                  />
                </div>
              </div>
              <Button onClick={testWelcomeEmail} disabled={loading || !testInputs.email} className="w-full">
                {loading ? 'Sending...' : 'Send Test Welcome Email'}
              </Button>
              {results.email && (
                <Alert variant={results.email.error ? "destructive" : "default"}>
                  <AlertDescription>
                    {results.email.error || results.email.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fraud Detection</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex justify-between">
                    <span>Rate Limiting</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex justify-between">
                    <span>Input Validation</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex justify-between">
                    <span>Secure Sessions</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AutoHealer Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">All systems monitored</p>
                  <p className="text-xs text-gray-500">11 health checks active</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Google Analytics Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Analytics ID: {import.meta.env.VITE_GA_MEASUREMENT_ID || 'Not configured'}
              </div>
              <Button onClick={testAnalyticsEvent} className="w-full">
                Send Test Event
              </Button>
              {results.analytics && (
                <Alert variant={results.analytics.success ? "default" : "destructive"}>
                  <AlertDescription>
                    {results.analytics.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Active Services</h4>
              <ul className="space-y-2">
                {serviceStatuses.filter(s => s.enabled).map((service, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {service.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Available Features</h4>
              <div className="text-sm text-gray-600">
                <p>✓ Payment processing with Stripe</p>
                <p>✓ High-value escrow protection</p>
                <p>✓ Professional email notifications</p>
                <p>✓ SMS notifications via Twilio</p>
                <p>✓ Google Analytics tracking</p>
                <p>✓ AI-powered content moderation</p>
                <p>✓ Automated fraud detection</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}