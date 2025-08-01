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
                <TrendingUp size={16} className="text-green-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">${thisWeekEarnings.toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                <Calendar size={16} className="text-yellow-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">${pendingEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          
          {completions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h4>
              <p className="text-gray-600 mb-4">Start completing tasks to see your earnings here!</p>
              <Link href="/">
                <Button>Browse Tasks</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {completions
                .sort((a, b) => new Date(b.completedAt || "").getTime() - new Date(a.completedAt || "").getTime())
                .map((completion) => (
                  <div key={completion.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Task Completion</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(completion.completedAt || "").toLocaleDateString()}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          completion.status === "approved" 
                            ? "bg-green-100 text-green-800"
                            : completion.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {completion.status.charAt(0).toUpperCase() + completion.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          completion.status === "approved" ? "text-green-600" : "text-gray-900"
                        }`}>
                          ${completion.earnings || "0.00"}
                        </p>
                        {completion.rating && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Star size={12} className="mr-1" />
                            {completion.rating}/5
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* How TaskParent Sustains Payments */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center mb-3">
              <Info className="text-blue-600 mr-2" size={20} />
              <h3 className="font-bold text-gray-900">How We Ensure Your Payments</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              TaskParent uses multiple revenue streams to guarantee sustainable payments to parents:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">15%</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Platform Service Fee</p>
                  <p className="text-xs text-gray-600">Small fee covers payment processing, insurance, and support</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Users className="text-white" size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Corporate Partnerships</p>
                  <p className="text-xs text-gray-600">Companies pay for employee meal prep and eldercare services</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Star className="text-white" size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Premium Memberships</p>
                  <p className="text-xs text-gray-600">Pro users pay $9.99/month for priority access and lower fees</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Shield className="text-white" size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Insurance & Trust</p>
                  <p className="text-xs text-gray-600">$1M liability coverage and secure payment processing</p>
                </div>
              </div>
            </div>
            
            <Link href="/how-it-works" className="inline-block mt-4 text-blue-600 text-sm font-medium hover:underline">
              Learn more about our business model →
            </Link>
          </div>
        </div>
      </div>

      <BottomNavigation currentPath="/earnings" />
    </div>
  );
}
