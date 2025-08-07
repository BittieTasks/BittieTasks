import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAnalyticsTracking } from '@/components/AnalyticsProvider';
import { useToast } from '@/hooks/use-toast';
import { Activity, Target, DollarSign, Users, FileText, Search } from 'lucide-react';

export default function AnalyticsTest() {
  const { 
    track, 
    trackTask, 
    trackUser, 
    trackPayment, 
    trackSearch, 
    trackFileUpload, 
    trackConversion, 
    trackBusiness 
  } = useAnalyticsTracking();
  
  const { toast } = useToast();
  const [testData, setTestData] = useState({
    eventName: 'test_event',
    searchQuery: 'house cleaning',
    taskId: 'task-123',
    amount: 25.50
  });

  const handleTrackEvent = (eventType: string) => {
    try {
      switch (eventType) {
        case 'custom':
          track(testData.eventName, { 
            category: 'Test',
            label: 'Manual Test Event',
            value: 1 
          });
          break;
        
        case 'task_view':
          trackTask('view', testData.taskId, 'Cleaning', 25);
          break;
        
        case 'user_signup':
          trackUser('signup', 'email', 'free');
          break;
        
        case 'payment_completed':
          trackPayment('completed', testData.amount, 'stripe', 'premium');
          break;
        
        case 'search':
          trackSearch(testData.searchQuery, 5);
          break;
        
        case 'file_upload':
          trackFileUpload('task_proof', 1024 * 500); // 500KB file
          break;
        
        case 'conversion':
          trackConversion('first_task', testData.amount, 'test-transaction-123');
          break;
        
        case 'business_metric':
          trackBusiness('earnings_generated', testData.amount, 'premium_task');
          break;
        
        default:
          console.log('Unknown event type');
          return;
      }

      toast({
        title: "Analytics Event Tracked",
        description: `Successfully tracked ${eventType} event`,
      });
    } catch (error) {
      toast({
        title: "Analytics Error",
        description: `Failed to track ${eventType} event`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Google Analytics Testing Dashboard
          </CardTitle>
          <CardDescription>
            Test Google Analytics integration and event tracking. Events are sent to both Google Analytics and our internal analytics system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Data Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Data Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventName">Custom Event Name</Label>
                <Input
                  id="eventName"
                  value={testData.eventName}
                  onChange={(e) => setTestData(prev => ({ ...prev, eventName: e.target.value }))}
                  placeholder="test_event"
                />
              </div>
              <div>
                <Label htmlFor="searchQuery">Search Query</Label>
                <Input
                  id="searchQuery"
                  value={testData.searchQuery}
                  onChange={(e) => setTestData(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="house cleaning"
                />
              </div>
              <div>
                <Label htmlFor="taskId">Task ID</Label>
                <Input
                  id="taskId"
                  value={testData.taskId}
                  onChange={(e) => setTestData(prev => ({ ...prev, taskId: e.target.value }))}
                  placeholder="task-123"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={testData.amount}
                  onChange={(e) => setTestData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="25.50"
                />
              </div>
            </div>
          </div>

          {/* Event Testing Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Testing</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                onClick={() => handleTrackEvent('custom')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Custom Event
              </Button>
              
              <Button 
                onClick={() => handleTrackEvent('task_view')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Task View
              </Button>
              
              <Button 
                onClick={() => handleTrackEvent('user_signup')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                User Signup
              </Button>
              
              <Button 
                onClick={() => handleTrackEvent('payment_completed')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Payment
              </Button>
              
              <Button 
                onClick={() => handleTrackEvent('search')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
              
              <Button 
                onClick={() => handleTrackEvent('file_upload')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                File Upload
              </Button>
              
              <Button 
                onClick={() => handleTrackEvent('conversion')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Conversion
              </Button>
              
              <Button 
                onClick={() => handleTrackEvent('business_metric')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Business Metric
              </Button>
            </div>
          </div>

          {/* Analytics Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analytics Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Google Analytics ID:</strong> {import.meta.env.VITE_GA_MEASUREMENT_ID || 'Not configured'}</p>
              <p><strong>Environment:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}</p>
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 80)}...</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Events are tracked in both Google Analytics (for external analytics) 
              and our internal analytics system (for platform insights). Check the browser console 
              for Google Analytics confirmation messages and the network tab for API requests.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}