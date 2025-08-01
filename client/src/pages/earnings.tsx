import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Star, Info, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/ui/bottom-navigation";
import type { User, TaskCompletion } from "@shared/schema";

export default function EarningsPage() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/current"]
  });

  const { data: completions = [], isLoading: completionsLoading } = useQuery<TaskCompletion[]>({
    queryKey: ["/api/user", user?.id, "completions"],
    enabled: !!user?.id
  });

  if (userLoading || completionsLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const approvedCompletions = completions.filter(c => c.status === "approved");
  const pendingEarnings = completions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + parseFloat(c.earnings || "0"), 0);

  const thisWeekEarnings = approvedCompletions
    .filter(c => {
      const completionDate = new Date(c.completedAt || "");
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completionDate >= weekAgo;
    })
    .reduce((sum, c) => sum + parseFloat(c.earnings || "0"), 0);

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Earnings</h1>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Earnings Overview */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Total Earnings</h2>
              <DollarSign size={24} />
            </div>
            <p className="text-3xl font-bold">${user?.totalEarnings || "0.00"}</p>
            <p className="text-sm opacity-90">{approvedCompletions.length} tasks completed</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">This Week</h3>
                <Calendar size={16} className="text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900">${thisWeekEarnings.toFixed(2)}</p>
              <p className="text-xs text-gray-500">7 days</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                <TrendingUp size={16} className="text-yellow-500" />
              </div>
              <p className="text-xl font-bold text-yellow-600">${pendingEarnings.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Under review</p>
            </div>
          </div>
        </div>

        {/* Dual Earning Breakdown */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Dual Earning Model</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <DollarSign className="text-white" size={12} />
                </div>
                <span className="text-sm font-medium text-gray-900">App Pays You</span>
              </div>
              <div className="text-lg font-bold text-blue-600">$180/week</div>
              <div className="text-xs text-gray-500">Personal tasks</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <Users className="text-white" size={12} />
                </div>
                <span className="text-sm font-medium text-gray-900">Neighbors Pay</span>
              </div>
              <div className="text-lg font-bold text-green-600">$395/week</div>
              <div className="text-xs text-gray-500">Shared tasks</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-3 text-white text-center">
            <div className="text-sm opacity-90">Combined Potential</div>
            <div className="text-2xl font-bold">$575/week</div>
            <div className="text-xs opacity-80">$29,900/year</div>
          </div>
        </div>

        {/* How It Works Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="text-blue-600" size={16} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">How You Get Paid</h4>
              <p className="text-sm text-gray-600 mb-2">
                TaskParent pays you directly for personal tasks, plus you earn extra when neighbors join your activities.
              </p>
              <Link href="/how-it-works">
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          
          {completions.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="text-gray-400" size={24} />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">No tasks completed yet</h4>
              <p className="text-sm text-gray-600 mb-4">
                Start earning by completing your first task! Remember, you get paid both by the app and neighbors.
              </p>
              <Link href="/">
                <Button>Browse Tasks</Button>
              </Link>
            </div>
          ) : (
            completions.slice(0, 5).map((completion) => (
              <div key={completion.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Task Completed</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    completion.status === "approved" ? "bg-green-100 text-green-700" :
                    completion.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {completion.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{new Date(completion.completedAt || "").toLocaleDateString()}</span>
                  <span className="font-medium text-gray-900">
                    ${completion.earnings || "0.00"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavigation currentPath="/earnings" />
    </div>
  );
}