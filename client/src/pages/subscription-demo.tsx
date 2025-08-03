import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Crown, Zap, Users, AlertTriangle, DollarSign, Calendar, Shield } from "lucide-react";

export default function SubscriptionDemo() {
  const [currentTier, setCurrentTier] = useState<"free" | "pro" | "premium">("free");
  const [monthlyTasks, setMonthlyTasks] = useState(3);

  const tierConfig = {
    free: {
      name: "TaskParent Free",
      price: "$0",
      monthlyLimit: 5,
      platformFee: 10,
      color: "bg-gray-100 text-gray-700",
      icon: Users
    },
    pro: {
      name: "TaskParent Pro", 
      price: "$9.99",
      monthlyLimit: 50,
      platformFee: 7,
      color: "bg-blue-100 text-blue-700",
      icon: Zap
    },
    premium: {
      name: "TaskParent Premium",
      price: "$19.99", 
      monthlyLimit: 999,
      platformFee: 5,
      color: "bg-purple-100 text-purple-700",
      icon: Crown
    }
  };

  const currentConfig = tierConfig[currentTier];
  const Icon = currentConfig.icon;

  const upgradeToTier = (tier: "free" | "pro" | "premium") => {
    setCurrentTier(tier);
    // Reset tasks to show new limits
    if (tier === "pro") setMonthlyTasks(3);
    if (tier === "premium") setMonthlyTasks(3);
  };

  const completeTask = () => {
    if (currentTier === "free" && monthlyTasks >= 5) return;
    if (currentTier === "pro" && monthlyTasks >= 50) return;
    setMonthlyTasks(prev => prev + 1);
  };

  const canCompleteTask = currentTier === "premium" || monthlyTasks < currentConfig.monthlyLimit;
  const progressPercentage = currentTier === "premium" ? 10 : (monthlyTasks / currentConfig.monthlyLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            TaskParent Subscription Demo
          </h1>
          <p className="text-gray-600">
            See the differences between Free, Pro, and Premium plans
          </p>
        </div>

        {/* Current Status Card */}
        <Card className="mb-8 border-2">
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 ${currentConfig.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icon className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">
              Current Plan: {currentConfig.name}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentConfig.price}/month • {currentConfig.platformFee}% platform fee
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{monthlyTasks}</div>
                <div className="text-sm text-gray-600">Tasks This Month</div>
                {currentTier !== "premium" && (
                  <div className="text-xs text-gray-500">of {currentConfig.monthlyLimit} limit</div>
                )}
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">${(monthlyTasks * 25 * (1 - currentConfig.platformFee/100)).toFixed(2)}</div>
                <div className="text-sm text-gray-600">Earnings After Fees</div>
                <div className="text-xs text-gray-500">${monthlyTasks * 25} gross - {currentConfig.platformFee}% fee</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{currentConfig.platformFee}%</div>
                <div className="text-sm text-gray-600">Platform Fee</div>
                <div className="text-xs text-gray-500">
                  {currentTier === "free" ? "Standard rate" : 
                   currentTier === "pro" ? "Save 3%" : "Save 5%"}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {currentTier !== "premium" && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Monthly Progress</span>
                  <span>{monthlyTasks}/{currentConfig.monthlyLimit} tasks</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                {monthlyTasks >= currentConfig.monthlyLimit - 1 && currentTier === "free" && (
                  <div className="mt-2 p-2 bg-orange-50 rounded flex items-center text-orange-700 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {monthlyTasks >= currentConfig.monthlyLimit ? "Monthly limit reached!" : "Almost at your limit"}
                  </div>
                )}
              </div>
            )}

            {/* Complete Task Button */}
            <div className="text-center mb-6">
              <Button 
                onClick={completeTask}
                disabled={!canCompleteTask}
                className="w-full md:w-auto"
              >
                {canCompleteTask ? "Complete a Task (+$25)" : "Monthly Limit Reached"}
              </Button>
              {!canCompleteTask && (
                <p className="text-sm text-red-600 mt-2">
                  Upgrade to continue earning this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(Object.keys(tierConfig) as Array<keyof typeof tierConfig>).map((tier) => {
            const config = tierConfig[tier];
            const TierIcon = config.icon;
            const isCurrentTier = currentTier === tier;
            
            return (
              <Card key={tier} className={`relative ${isCurrentTier ? 'ring-2 ring-blue-500' : ''}`}>
                {tier === "pro" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${config.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <TierIcon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{config.name}</CardTitle>
                  <div className="text-2xl font-bold">{config.price}</div>
                  <div className="text-sm text-gray-600">per month</div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>{tier === "premium" ? "Unlimited" : config.monthlyLimit} tasks/month</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>{config.platformFee}% platform fee</span>
                    </div>
                    <div className="flex items-center text-sm">
                      {tier === "free" ? (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      )}
                      <span>Ad-free experience</span>
                    </div>
                    <div className="flex items-center text-sm">
                      {tier === "free" ? (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      )}
                      <span>Priority support</span>
                    </div>
                    {tier === "premium" && (
                      <>
                        <div className="flex items-center text-sm">
                          <Crown className="h-4 w-4 text-purple-500 mr-2" />
                          <span>Exclusive high-paying tasks</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Shield className="h-4 w-4 text-purple-500 mr-2" />
                          <span>24/7 phone support</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Button
                    className="w-full"
                    variant={isCurrentTier ? "outline" : "default"}
                    onClick={() => upgradeToTier(tier)}
                    disabled={isCurrentTier}
                  >
                    {isCurrentTier ? "Current Plan" : `Switch to ${config.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Earnings Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings Comparison</CardTitle>
            <CardDescription>
              Based on completing 20 tasks at $25 each ($500 gross earnings)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">Free Plan</div>
                <div className="text-2xl font-bold text-red-600">Cannot Complete</div>
                <div className="text-sm text-gray-600">Limited to 5 tasks/month</div>
                <div className="text-xs text-gray-500 mt-1">Max: $112.50 after fees</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-900">Pro Plan</div>
                <div className="text-2xl font-bold text-blue-600">$465</div>
                <div className="text-sm text-gray-600">$500 - 7% platform fee</div>
                <div className="text-xs text-gray-500 mt-1">$35 saved vs Free</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-900">Premium Plan</div>
                <div className="text-2xl font-bold text-purple-600">$475</div>
                <div className="text-sm text-gray-600">$500 - 5% platform fee</div>
                <div className="text-xs text-gray-500 mt-1">$50 saved vs Free</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}