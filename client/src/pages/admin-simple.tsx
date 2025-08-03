import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  // Mock data for demo - shows what the owner would see
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalTasks: 156,
    pendingApprovals: 8,
    totalRevenue: 28450.75,
    platformFees: 4267.61, // 15% of total revenue
    monthlyGrowth: 23
  };

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
            <CardTitle className="text-sm font-medium">Tasks Needing Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Require your review to pay users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              Month over month user growth
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
                <span className="font-medium">Approve Completed Tasks</span>
              </div>
              <span className="text-sm text-gray-600">8 pending</span>
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
            <p className="text-lg font-semibold">Total Monthly Revenue: ${((stats.platformFees) + 2470 + 5200).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Projected annual revenue: ${(((stats.platformFees) + 2470 + 5200) * 12).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Monitoring */}
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
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-gray-600">Active Communities</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}