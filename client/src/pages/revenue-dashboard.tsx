import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  Building2, 
  Calendar,
  Award,
  BarChart3
} from "lucide-react";

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSponsorships: number;
  totalParticipants: number;
  averageTaskValue: number;
  topPartners: Array<{
    name: string;
    spent: number;
    tasks: number;
  }>;
}

export default function RevenueDashboard() {
  const { data: revenue, isLoading } = useQuery<RevenueData>({
    queryKey: ['/api/revenue/dashboard'],
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!revenue) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Revenue Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load revenue data. Please check your authentication and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Revenue Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your sponsorship revenue and partnership performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${revenue.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time earnings from sponsorships
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${revenue.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sponsorships</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {revenue.activeSponsorships}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently running campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {revenue.totalParticipants}
              </div>
              <p className="text-xs text-muted-foreground">
                Families engaged this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Revenue Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Task Value</span>
                <span className="font-semibold text-lg">${revenue.averageTaskValue}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue per Participant</span>
                <span className="font-semibold text-lg">
                  ${(revenue.totalRevenue / revenue.totalParticipants).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Growth Rate</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  +23%
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Partner Retention</span>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  89%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Partners
              </CardTitle>
              <CardDescription>
                Highest spending corporate partners this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenue.topPartners.map((partner, index) => (
                  <div key={partner.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {partner.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {partner.tasks} active tasks
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${partner.spent.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        spent this month
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Grow your revenue with these recommended actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.open('/partners', '_blank')}
              >
                <Building2 className="h-6 w-6" />
                <span className="text-sm font-medium">View Partner Portal</span>
                <span className="text-xs text-gray-500">Attract new sponsors</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.location.href = '/admin'}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm font-medium">Manage Tasks</span>
                <span className="text-xs text-gray-500">Optimize campaigns</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.location.href = '/analytics'}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm font-medium">View Analytics</span>
                <span className="text-xs text-gray-500">Track performance</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.location.href = 'mailto:partnerships@bittietasks.com'}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm font-medium">Schedule Call</span>
                <span className="text-xs text-gray-500">Discuss expansion</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Projections */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Revenue Projections</CardTitle>
            <CardDescription>
              Based on current growth trends and pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Next Month</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  ${(revenue.monthlyRevenue * 1.23).toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">+23% growth</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200">Next Quarter</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ${(revenue.monthlyRevenue * 3 * 1.35).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">+35% quarterly growth</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200">This Year</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  ${(revenue.monthlyRevenue * 12 * 1.5).toLocaleString()}
                </p>
                <p className="text-sm text-purple-600 mt-1">+50% annual projection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}