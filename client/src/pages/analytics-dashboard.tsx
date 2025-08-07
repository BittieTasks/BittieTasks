import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Users, Activity, DollarSign, Eye, Search, FileText, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface PlatformMetrics {
  totalEvents: number;
  uniqueUsers: number;
  taskViews: number;
  taskCompletions: number;
  paymentAttempts: number;
  searchQueries: number;
  conversionRate: number;
  topCategories: Array<{category: string, count: number}>;
  peakHours: Array<{hour: number, count: number}>;
}

export default function AnalyticsDashboard() {
  const [, setLocation] = useLocation();
  
  const { data: platformMetrics, isLoading, refetch } = useQuery<PlatformMetrics>({
    queryKey: ["/api/analytics/platform"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/simple-admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Platform insights and user behavior analytics
              </p>
            </div>
            
            <Button onClick={() => refetch()} variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics?.totalEvents?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics?.uniqueUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Unique users active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics?.conversionRate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">View to completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Task Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics?.taskViews || 0}</div>
              <p className="text-xs text-muted-foreground">Tasks viewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Peak Hours Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Activity Hours</CardTitle>
              <CardDescription>User activity throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformMetrics?.peakHours || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                    formatter={(value) => [value, 'Events']}
                  />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>Most viewed task categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformMetrics?.topCategories?.slice(0, 5) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({category, count}) => `${category} (${count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(platformMetrics?.topCategories || []).slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Task Activity</CardTitle>
              <CardDescription>Task engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Task Views</span>
                  <Badge variant="secondary">{platformMetrics?.taskViews || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Task Completions</span>
                  <Badge variant="secondary">{platformMetrics?.taskCompletions || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <Badge 
                    variant={
                      (platformMetrics?.conversionRate || 0) > 10 ? "default" : 
                      (platformMetrics?.conversionRate || 0) > 5 ? "secondary" : "destructive"
                    }
                  >
                    {platformMetrics?.conversionRate?.toFixed(1) || 0}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Platform interaction metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Search Queries</span>
                  <Badge variant="secondary">{platformMetrics?.searchQueries || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payment Attempts</span>
                  <Badge variant="secondary">{platformMetrics?.paymentAttempts || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Events</span>
                  <Badge variant="secondary">{platformMetrics?.totalEvents || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Platform performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Fraud Detection Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">AutoHealer Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Analytics Tracking</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLocation('/system-status')}
                  className="w-full"
                >
                  View System Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Analytics data updates in real-time</p>
          <p>Fraud detection and system monitoring active</p>
        </div>
      </div>
    </div>
  );
}