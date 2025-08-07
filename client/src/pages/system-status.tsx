import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, CheckCircle, AlertTriangle, XCircle, Bot } from "lucide-react";
import { useLocation } from "wouter";

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  autoFixed?: boolean;
}

interface SystemStatus {
  timestamp: string;
  status: string;
  checks: HealthCheck[];
  autoHealer: {
    active: boolean;
    description: string;
  };
}

export default function SystemStatus() {
  const [, setLocation] = useLocation();
  
  const { data: systemStatus, isLoading, refetch } = useQuery<SystemStatus>({
    queryKey: ["/api/health"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                System Status
              </h1>
              <p className="text-gray-600">
                Real-time monitoring and automated health checks
              </p>
            </div>
            
            <Button onClick={() => refetch()} variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(systemStatus?.status || 'unknown')}
                <div>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>
                    Last updated: {systemStatus?.timestamp ? new Date(systemStatus.timestamp).toLocaleString() : 'Unknown'}
                  </CardDescription>
                </div>
              </div>
              
              <Badge className={getStatusColor(systemStatus?.status || 'unknown')}>
                {systemStatus?.status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* AutoHealer Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-blue-500" />
              <div>
                <CardTitle>AutoHealer System</CardTitle>
                <CardDescription>
                  {systemStatus?.autoHealer?.description || 'Automated monitoring system'}
                </CardDescription>
              </div>
              <Badge className={systemStatus?.autoHealer?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {systemStatus?.autoHealer?.active ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The AutoHealer continuously monitors system health, detects issues, and automatically fixes problems like database disconnections, API failures, and service outages.
            </p>
          </CardContent>
        </Card>

        {/* Individual Health Checks */}
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Health Checks</h2>
          
          {systemStatus?.checks?.map((check, index) => (
            <Card key={index} className="border-l-4" style={{
              borderLeftColor: check.status === 'healthy' ? '#10b981' : 
                               check.status === 'warning' ? '#f59e0b' : '#ef4444'
            }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <CardTitle className="text-lg">{check.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {new Date(check.timestamp).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {check.autoFixed && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Bot className="w-3 h-3 mr-1" />
                        Auto-Fixed
                      </Badge>
                    )}
                    <Badge className={getStatusColor(check.status)}>
                      {check.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-700">{check.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>System monitoring updates every 30 seconds</p>
          <p>AutoHealer runs continuous health checks and automatic repairs</p>
        </div>
      </div>
    </div>
  );
}