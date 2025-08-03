import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Bot,
  Zap,
  Settings
} from "lucide-react";

export default function AdminDashboard() {
  // Fetch real platform statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch AI approval statistics  
  const { data: aiStats, isLoading: aiLoading } = useQuery({
    queryKey: ['/api/admin/ai-stats'],
    refetchInterval: 30000
  });

  if (isLoading || aiLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TaskParent Owner Dashboard</h1>
          <p className="text-gray-600">Platform management and revenue overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
          <Badge variant="outline" className="mt-1">Platform Owner</Badge>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers.toLocaleString()} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Revenue (15% Fee)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.platformFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.totalRevenue.toLocaleString()} total platform GMV
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Approvals Needed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {aiStats?.aiApproved || 0} auto-approved by AI today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Automation</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats?.aiApprovalRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Solo tasks auto-approved by AI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Owner Functions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Management</CardTitle>
            <CardDescription>Key functions for running TaskParent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Manual Task Approvals</span>
              </div>
              <span className="text-sm text-gray-600">{stats?.pendingApprovals || 0} pending</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Monitor User Activity</span>
              </div>
              <span className="text-sm text-gray-600">1,247 users</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Review Reported Content</span>
              </div>
              <span className="text-sm text-gray-600">2 reports</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue & Payouts</CardTitle>
            <CardDescription>Your earnings as platform owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Monthly Revenue</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                ${stats.platformFees.toLocaleString()}
              </div>
              <p className="text-sm text-green-700">15% platform fee from all completed tasks</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Next payout date:</span>
                <span className="font-medium">March 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Payment method:</span>
                <span className="font-medium">Bank ****4567</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Payout frequency:</span>
                <span className="font-medium">Monthly</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How You Get Paid */}
      <Card>
        <CardHeader>
          <CardTitle>How TaskParent Makes You Money</CardTitle>
          <CardDescription>Your revenue streams as platform owner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600">Service Fees (15%)</h3>
              <p className="text-2xl font-bold">${stats.platformFees.toLocaleString()}</p>
              <p className="text-sm text-gray-600">From every completed task payment</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-purple-600">TaskParent Pro</h3>
              <p className="text-2xl font-bold">$2,470</p>
              <p className="text-sm text-gray-600">Monthly subscriptions ($9.99/month)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600">Brand Partnerships</h3>
              <p className="text-2xl font-bold">$5,200</p>
              <p className="text-sm text-gray-600">Sponsored community tasks</p>
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-semibold">Total Monthly Revenue: ${(((stats?.platformFees || 0) + 2470 + 5200)).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Projected annual revenue: ${((((stats?.platformFees || 0) + 2470 + 5200) * 12)).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Automation System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>AI Task Approval System</span>
            <Badge variant="outline" className="ml-2">ACTIVE</Badge>
          </CardTitle>
          <CardDescription>Automated approval for low-risk solo tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Auto-Approved</span>
              </div>
              <div className="text-2xl font-bold text-green-800">{aiStats?.aiApproved || 0}</div>
              <p className="text-sm text-green-700">Solo self-care tasks</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Time Saved</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{aiStats?.timeSavedHours || 0}h</div>
              <p className="text-sm text-blue-700">{aiStats?.timeSavedMinutes || 0} minutes total</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-purple-50">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-purple-800">{aiStats?.automationEfficiency || 0}%</div>
              <p className="text-sm text-purple-700">Tasks automated</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How AI Approval Works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ✅ <strong>Auto-approves:</strong> Solo self-care tasks under $50 with photo proof + detailed notes</li>
              <li>• 🔍 <strong>Manual review:</strong> Shared tasks, high-value tasks, or missing documentation</li>
              <li>• 💰 <strong>Instant payment:</strong> Users get paid immediately for AI-approved tasks</li>
              <li>• 🛡️ <strong>Safety first:</strong> All multi-person tasks require your manual approval</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-gray-600">Task Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4.8/5</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">99.2%</div>
              <div className="text-sm text-gray-600">Payment Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.totalTasks || 0}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}