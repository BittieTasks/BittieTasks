import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, Star, Zap, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function SubscriptionPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/current"]
  });

  const subscriptionPlans = [
    {
      id: "free",
      name: "BittieTasks Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with community tasks",
      icon: Users,
      color: "bg-gray-100 text-gray-700",
      borderColor: "border-gray-200",
      features: [
        "Complete up to 5 tasks per month",
        "Basic task marketplace access",
        "Community messaging",
        "Standard earnings (10% platform fee)",
        "Email support",
        "Mobile app access"
      ],
      limitations: [
        "Limited to 5 tasks monthly",
        "Standard platform fees",
        "Ads displayed",
        "Basic support only"
      ]
    },
    {
      id: "pro",
      name: "BittieTasks Pro",
      price: "$9.99",
      period: "per month",
      description: "For active parents earning regular income",
      icon: Zap,
      color: "bg-blue-100 text-blue-700",
      borderColor: "border-blue-300",
      popular: true,
      features: [
        "Complete up to 50 tasks per month",
        "Priority task visibility",
        "Reduced platform fee (7% instead of 10%)",
        "Ad-free experience",
        "Priority customer support",
        "Advanced earnings analytics",
        "Early access to sponsored tasks",
        "Pro badge on profile"
      ],
      savings: "Save $36+ monthly in platform fees"
    },
    {
      id: "premium",
      name: "BittieTasks Premium",
      price: "$19.99",
      period: "per month",
      description: "For power users maximizing their earnings",
      icon: Crown,
      color: "bg-purple-100 text-purple-700",
      borderColor: "border-purple-300",
      features: [
        "Unlimited monthly tasks",
        "Lowest platform fee (5%)",
        "Premium badge & priority listing",
        "Exclusive high-paying tasks",
        "1-on-1 success coaching",
        "Advanced scheduling tools",
        "Custom task requests",
        "24/7 phone support",
        "Early access to new features"
      ],
      savings: "Save $60+ monthly in platform fees"
    }
  ];

  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest("POST", "/api/subscription/upgrade", { planId });
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Updated",
        description: `Successfully upgraded to ${selectedPlan}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    upgradeMutation.mutate(planId);
  };

  const currentTier = user?.subscriptionTier || "free";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your TaskParent Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your earning potential with plans designed for every parent's lifestyle
          </p>
          
          {user && (
            <div className="mt-6 inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Current Usage Stats */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user.monthlyTasksCompleted || 0}
                </div>
                <div className="text-sm text-gray-600">Tasks This Month</div>
                {currentTier === "free" && (
                  <div className="text-xs text-gray-500 mt-1">
                    of {user.monthlyTaskLimit || 5} monthly limit
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${user.totalEarnings || "0.00"}
                </div>
                <div className="text-sm text-gray-600">Total Earnings</div>
                <div className="text-xs text-gray-500 mt-1">
                  Platform fee: {currentTier === "free" ? "10%" : currentTier === "pro" ? "7%" : "5%"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {user.completedTasks || 0}
                </div>
                <div className="text-sm text-gray-600">Total Tasks</div>
                <div className="text-xs text-gray-500 mt-1">
                  {user.rating || "0.0"} average rating
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentTier === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.borderColor} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-600 ml-1">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-center">
                    {plan.description}
                  </CardDescription>
                  
                  {plan.savings && (
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {plan.savings}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Features:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations && (
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="font-semibold text-gray-700">Limitations:</h4>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="text-sm text-gray-500">
                          • {limitation}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan || upgradeMutation.isPending}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan 
                      ? "Current Plan" 
                      : upgradeMutation.isPending && selectedPlan === plan.id
                        ? "Processing..."
                        : plan.id === "free" 
                          ? "Downgrade to Free"
                          : `Upgrade to ${plan.name}`
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>
              Detailed comparison of all TaskParent plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Free</th>
                    <th className="text-center py-3 px-4">Pro</th>
                    <th className="text-center py-3 px-4">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 px-4 font-medium">Monthly Task Limit</td>
                    <td className="text-center py-3 px-4">5 tasks</td>
                    <td className="text-center py-3 px-4">50 tasks</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Platform Fee</td>
                    <td className="text-center py-3 px-4">10%</td>
                    <td className="text-center py-3 px-4">7%</td>
                    <td className="text-center py-3 px-4">5%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Ad-Free Experience</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Priority Support</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">✅ + Phone</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Early Access</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">What happens if I exceed my task limit?</h4>
                <p className="text-gray-600">Free users are limited to 5 tasks per month. You'll need to upgrade to continue completing tasks or wait for your monthly reset.</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">How much can I save with Pro or Premium?</h4>
                <p className="text-gray-600">Pro users save 3% on platform fees, Premium users save 5%. On $1,000 monthly earnings, that's $30-50 saved per month.</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Is there a commitment period?</h4>
                <p className="text-gray-600">No, all plans are month-to-month with no long-term commitment. Cancel anytime.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}