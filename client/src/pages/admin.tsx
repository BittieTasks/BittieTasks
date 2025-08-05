import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Star,
  Eye,
  Ban,
  MessageSquare,
  Target,
  Settings,
  Shield,
  Zap,
  Building,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  earnings: number;
  completedTasks: number;
  rating: number;
  joinedAt: string;
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
}

interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  taskTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  earnings: number;
  submissionNotes: string;
  proofFiles: string[];
  completedAt: string;
}

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  pendingApprovals: number;
  totalRevenue: number;
  platformFees: number;
  monthlyGrowth: number;
  // Advertising Stats
  totalAdvertisers: number;
  approvedAdvertisers: number;
  pendingAdvertisers: number;
  rejectedAdvertisers: number;
  adRevenue: number;
  // Ad Preferences Stats
  usersWithAdPreferences: number;
  averageAdFrequency: number;
  averageAdRelevance: number;
  ethicalAdsOnlyUsers: number;
  familyFriendlyOnlyUsers: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch platform statistics
  const { data: stats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch pending task approvals
  const { data: pendingTasks, isLoading: tasksLoading } = useQuery<TaskCompletion[]>({
    queryKey: ["/api/admin/pending-tasks"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch user management data
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Task approval mutation
  const approveTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; approved: boolean; notes?: string }) =>
      apiRequest("POST", "/api/admin/approve-task", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Task Updated",
        description: "Task approval status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // User management mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: string; action: 'suspend' | 'activate' | 'verify' }) =>
      apiRequest("POST", "/api/admin/manage-user", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Updated",
        description: "User status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const handleApproveTask = (taskId: string, approved: boolean, notes?: string) => {
    approveTaskMutation.mutate({ taskId, approved, notes });
  };

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'verify') => {
    updateUserMutation.mutate({ userId, action });
  };

  if (statsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TaskParent Admin</h1>
          <p className="text-gray-600">Platform management and oversight</p>
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
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.platformFees?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.totalRevenue?.toLocaleString() || 0} total GMV
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.monthlyGrowth || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">
            Tasks
            {stats?.pendingApprovals ? (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {stats.pendingApprovals}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="advertising">
            Advertising
            {stats?.pendingAdvertisers ? (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {stats.pendingAdvertisers}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="ad-preferences">
            <Target className="h-4 w-4 mr-1" />
            Ad Prefs
          </TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Satisfaction</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">4.8/5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Task Completion Rate</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Success Rate</span>
                  <span className="font-medium">99.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Community Groups</span>
                  <span className="font-medium">156</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Platform activity summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">12 new users registered today</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">34 tasks completed today</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">$1,247 in platform fees earned today</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">3 support tickets resolved</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Task Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          {tasksLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pending tasks...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks?.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No pending task approvals at this time.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingTasks?.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{task.taskTitle}</CardTitle>
                          <CardDescription>
                            Submitted by {task.userName} • ${task.earnings} earning
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Pending Review</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Submission Notes:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {task.submissionNotes || "No notes provided"}
                        </p>
                      </div>
                      
                      {task.proofFiles.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Proof Files:</h4>
                          <div className="flex flex-wrap gap-2">
                            {task.proofFiles.map((file, index) => (
                              <Button key={index} variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View File {index + 1}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3 pt-4 border-t">
                        <Button
                          onClick={() => handleApproveTask(task.id, true)}
                          disabled={approveTaskMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve & Pay
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleApproveTask(task.id, false, "Quality standards not met")}
                          disabled={approveTaskMutation.isPending}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users?.map((user) => (
                <Card key={user.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {user.completedTasks} tasks • ${user.earnings} earned
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600">{user.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.verified ? "default" : "secondary"}>
                          {user.verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant={user.status === 'active' ? "default" : "destructive"}>
                          {user.status}
                        </Badge>
                        <div className="flex space-x-1">
                          {!user.verified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'verify')}
                            >
                              Verify
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={user.status === 'active' ? "destructive" : "default"}
                            onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                          >
                            {user.status === 'active' ? (
                              <>
                                <Ban className="h-4 w-4 mr-1" />
                                Suspend
                              </>
                            ) : (
                              'Activate'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Your platform earnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Platform Service Fees (15%)</span>
                  <span className="font-medium">${stats?.platformFees?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">TaskParent Pro Subscriptions</span>
                  <span className="font-medium">$2,470</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Corporate Partnerships</span>
                  <span className="font-medium">$5,200</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Premium Features</span>
                  <span className="font-medium">$890</span>
                </div>
                <div className="flex items-center justify-between py-2 font-semibold text-lg border-t-2">
                  <span>Total Monthly Revenue</span>
                  <span>${((stats?.platformFees || 0) + 2470 + 5200 + 890).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payout Information</CardTitle>
                <CardDescription>Your payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Payment Method Active</span>
                  </div>
                  <p className="text-sm text-green-700">Bank account ending in ****4567</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Next payout date:</span>
                    <span className="font-medium">March 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending payout amount:</span>
                    <span className="font-medium">${(stats?.platformFees || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payout frequency:</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  Update Payment Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advertising" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Advertising Overview Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Advertiser Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Advertisers</span>
                  <span className="font-semibold">{stats?.totalAdvertisers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Approved</span>
                  <span className="font-semibold text-green-600">{stats?.approvedAdvertisers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-yellow-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{stats?.pendingAdvertisers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Rejected</span>
                  <span className="font-semibold text-red-600">{stats?.rejectedAdvertisers || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ad Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${stats?.adRevenue?.toLocaleString() || "0"}
                  </div>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Platform Fee (15%)</span>
                    <span>${((stats?.adRevenue || 0) * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>User Earnings (70%)</span>
                    <span>${((stats?.adRevenue || 0) * 0.70).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Creator Bonus (15%)</span>
                    <span>${((stats?.adRevenue || 0) * 0.15).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Ethical Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.approvedAdvertisers ? Math.round((stats.approvedAdvertisers / stats.totalAdvertisers) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Approval Rate</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>HRC 75+ Score</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Child Safety</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>COPPA Compliant</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Advertiser Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Advertiser Applications</CardTitle>
              <CardDescription>Review and approve new advertising partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Demo pending advertisers */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">EcoTech Solutions</h4>
                      <p className="text-sm text-gray-600">Sustainable family technology products</p>
                    </div>
                    <Badge variant="secondary">Pending Review</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">HRC Score:</span>
                      <span className="font-medium ml-1">85/100</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium ml-1">$2,500/mo</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium ml-1">Technology</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Child Safe:</span>
                      <CheckCircle className="h-4 w-4 text-green-600 inline" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Review Details
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">GreenSpace Learning</h4>
                      <p className="text-sm text-gray-600">Educational outdoor programs for families</p>
                    </div>
                    <Badge variant="secondary">Pending Review</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">HRC Score:</span>
                      <span className="font-medium ml-1">92/100</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium ml-1">$1,800/mo</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium ml-1">Education</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Child Safe:</span>
                      <CheckCircle className="h-4 w-4 text-green-600 inline" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Review Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ad-preferences" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Ad Preferences Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.usersWithAdPreferences || 0}
                  </div>
                  <p className="text-sm text-gray-600">Users with custom preferences</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avg. Ad Frequency</span>
                    <span className="font-medium">{stats?.averageAdFrequency || 5}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Relevance</span>
                    <span className="font-medium">{stats?.averageAdRelevance || 7}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Safety Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Family-Friendly Only</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stats?.familyFriendlyOnlyUsers || 0}</span>
                      <span className="text-xs text-gray-500">
                        ({stats?.familyFriendlyOnlyUsers ? Math.round((stats.familyFriendlyOnlyUsers / stats.totalUsers) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ethical Ads Only</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stats?.ethicalAdsOnlyUsers || 0}</span>
                      <span className="text-xs text-gray-500">
                        ({stats?.ethicalAdsOnlyUsers ? Math.round((stats.ethicalAdsOnlyUsers / stats.totalUsers) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Ad Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <p className="text-sm text-gray-600">User Satisfaction</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Relevant Ads</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Click-through Rate</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Categories Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Ad Categories</CardTitle>
              <CardDescription>Most selected categories by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-medium">Education</div>
                  <div className="text-sm text-gray-600">68% of users</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🏃‍♀️</div>
                  <div className="font-medium">Health & Wellness</div>
                  <div className="text-sm text-gray-600">64% of users</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🛍️</div>
                  <div className="font-medium">Family Shopping</div>
                  <div className="text-sm text-gray-600">58% of users</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-medium">Family Tech</div>
                  <div className="text-sm text-gray-600">42% of users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ad Types Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Type Preferences</CardTitle>
              <CardDescription>User preferences by ad format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Native Feed Ads</div>
                      <div className="text-sm text-gray-600">Seamlessly integrated with task feeds</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">82%</div>
                    <div className="text-xs text-gray-500">preferred</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Sponsored Tasks</div>
                      <div className="text-sm text-gray-600">Company-sponsored activities</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">76%</div>
                    <div className="text-xs text-gray-500">preferred</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Affiliate Products</div>
                      <div className="text-sm text-gray-600">Product recommendations with commissions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">61%</div>
                    <div className="text-xs text-gray-500">preferred</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Banner Ads</div>
                      <div className="text-sm text-gray-600">Traditional display advertising</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">34%</div>
                    <div className="text-xs text-gray-500">preferred</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}