import { Crown, Zap, AlertCircle, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

interface SubscriptionBannerProps {
  user: User;
}

export default function SubscriptionBanner({ user }: SubscriptionBannerProps) {
  const tier = user.subscriptionTier || "free";
  const monthlyCompleted = user.monthlyTasksCompleted || 0;
  const monthlyLimit = user.monthlyTaskLimit || 5;
  const isNearLimit = tier === "free" && monthlyCompleted >= monthlyLimit - 1;
  const isAtLimit = tier === "free" && monthlyCompleted >= monthlyLimit;

  // Don't show banner for premium users unless they're new
  if (tier === "premium" && user.completedTasks && user.completedTasks > 5) {
    return null;
  }

  const getBannerContent = () => {
    if (isAtLimit) {
      return {
        icon: AlertCircle,
        title: "Monthly Task Limit Reached",
        subtitle: `You've completed ${monthlyCompleted}/${monthlyLimit} free tasks this month`,
        description: "Upgrade to Pro for 50 tasks/month or Premium for unlimited tasks",
        ctaText: "Upgrade Now",
        bgColor: "bg-red-50 border-red-200",
        iconColor: "text-red-600",
        ctaColor: "bg-red-600 hover:bg-red-700"
      };
    }

    if (isNearLimit) {
      return {
        icon: AlertCircle,
        title: "Almost at Your Task Limit",
        subtitle: `${monthlyCompleted}/${monthlyLimit} free tasks completed this month`,
        description: "Upgrade now to avoid interruption in your earnings",
        ctaText: "Upgrade Now",
        bgColor: "bg-orange-50 border-orange-200",
        iconColor: "text-orange-600",
        ctaColor: "bg-orange-600 hover:bg-orange-700"
      };
    }

    if (tier === "free") {
      return {
        icon: TrendingUp,
        title: "Unlock Your Earning Potential",
        subtitle: `${monthlyCompleted}/${monthlyLimit} free tasks completed`,
        description: "Upgrade to Pro: 50 tasks/month + 7% platform fee (vs 10%) + Ad-free",
        ctaText: "See Plans",
        bgColor: "bg-blue-50 border-blue-200",
        iconColor: "text-blue-600",
        ctaColor: "bg-blue-600 hover:bg-blue-700"
      };
    }

    if (tier === "pro") {
      return {
        icon: Crown,
        title: "Consider Premium",
        subtitle: `${monthlyCompleted}/50 Pro tasks completed`,
        description: "Upgrade to Premium: Unlimited tasks + 5% platform fee + Exclusive opportunities",
        ctaText: "Upgrade to Premium",
        bgColor: "bg-purple-50 border-purple-200",
        iconColor: "text-purple-600",
        ctaColor: "bg-purple-600 hover:bg-purple-700"
      };
    }

    return null;
  };

  const content = getBannerContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <Card className={`${content.bgColor} mb-6`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full bg-white shadow-sm`}>
            <Icon className={`h-5 w-5 ${content.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900">{content.title}</h3>
              {tier !== "free" && (
                <Badge variant="secondary" className="text-xs">
                  {tier.toUpperCase()}
                </Badge>
              )}
            </div>
            
            <p className="text-sm font-medium text-gray-700 mb-1">
              {content.subtitle}
            </p>
            
            <p className="text-sm text-gray-600 mb-3">
              {content.description}
            </p>

            {/* Progress bar for free users */}
            {tier === "free" && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Monthly Progress</span>
                  <span>{monthlyCompleted}/{monthlyLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isNearLimit ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((monthlyCompleted / monthlyLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Link href="/subscription">
                <Button size="sm" className={content.ctaColor}>
                  {content.ctaText}
                </Button>
              </Link>
              
              {tier !== "free" && (
                <span className="text-xs text-gray-500">
                  Save {tier === "pro" ? "3%" : "5%"} on platform fees
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}