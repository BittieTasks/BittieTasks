import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  Clock,
  Users,
  Download
} from 'lucide-react';

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
  tasksCompleted: number;
  activeReferrals: number;
  monthlyGoal: number;
  weeklyStreak: number;
}

interface Transaction {
  id: string;
  type: 'task_completion' | 'referral_bonus' | 'corporate_sponsorship';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  taskTitle?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

export default function EarningsDashboard() {
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['/api/earnings'],
    queryFn: () => apiRequest('GET', '/api/earnings').then(res => res.json())
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/earnings/transactions'],
    queryFn: () => apiRequest('GET', '/api/earnings/transactions').then(res => res.json())
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: () => apiRequest('GET', '/api/achievements').then(res => res.json())
  });

  if (earningsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const data: EarningsData = earnings || {
    totalEarnings: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0,
    tasksCompleted: 0,
    activeReferrals: 0,
    monthlyGoal: 500,
    weeklyStreak: 0
  };

  const monthlyProgress = (data.thisMonth / data.monthlyGoal) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Earnings Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track your income from shared tasks and community activities
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Earnings Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All-time earnings from tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.thisMonth.toFixed(2)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Progress value={monthlyProgress} className="w-16" />
              <span>{monthlyProgress.toFixed(0)}% of goal</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.thisWeek.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {data.weeklyStreak} day streak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.today.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {data.tasksCompleted} tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Monthly Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                ${data.thisMonth.toFixed(2)} of ${data.monthlyGoal.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                ${(data.monthlyGoal - data.thisMonth).toFixed(2)} remaining
              </span>
            </div>
            <Progress value={monthlyProgress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction: Transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.taskTitle && (
                            <p className="text-sm text-muted-foreground">{transaction.taskTitle}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+${transaction.amount.toFixed(2)}</p>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Complete tasks to start earning!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievementsLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              achievements.map((achievement: Achievement) => (
                <Card key={achievement.id} className={`${achievement.earned ? 'border-yellow-200 dark:border-yellow-800' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Award className={`w-5 h-5 ${
                          achievement.earned ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{achievement.title}</CardTitle>
                        {achievement.earned && achievement.earnedDate && (
                          <p className="text-xs text-muted-foreground">
                            Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    {!achievement.earned && achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                      </div>
                    )}
                    {achievement.earned && (
                      <Badge className="w-full justify-center">Earned!</Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Earning Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Shared Tasks</span>
                    </div>
                    <span className="font-medium">${(data.totalEarnings * 0.7).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Corporate Sponsorships</span>
                    </div>
                    <span className="font-medium">${(data.totalEarnings * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Referral Bonuses</span>
                    </div>
                    <span className="font-medium">${(data.totalEarnings * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasks Completed</span>
                    <span className="font-medium">{data.tasksCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average per Task</span>
                    <span className="font-medium">
                      ${data.tasksCompleted > 0 ? (data.totalEarnings / data.tasksCompleted).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Referrals</span>
                    <span className="font-medium">{data.activeReferrals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Streak</span>
                    <span className="font-medium">{data.weeklyStreak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}