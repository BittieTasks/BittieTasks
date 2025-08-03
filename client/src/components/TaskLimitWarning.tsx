import { AlertTriangle, Crown } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TaskLimitWarningProps {
  tier: string;
  monthlyCompleted: number;
  monthlyLimit: number;
  onTaskAttempt?: () => void;
}

export default function TaskLimitWarning({ 
  tier, 
  monthlyCompleted, 
  monthlyLimit,
  onTaskAttempt 
}: TaskLimitWarningProps) {
  const isAtLimit = monthlyCompleted >= monthlyLimit;
  const isNearLimit = monthlyCompleted >= monthlyLimit - 1;

  if (tier !== "free" || (!isAtLimit && !isNearLimit)) {
    return null;
  }

  return (
    <Alert className={`mb-4 ${isAtLimit ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${isAtLimit ? 'text-red-600' : 'text-orange-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            {isAtLimit ? "Monthly task limit reached" : "Almost at your monthly limit"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {isAtLimit 
              ? "You've completed all 5 free tasks this month. Upgrade to continue earning."
              : `${monthlyCompleted}/${monthlyLimit} free tasks completed. Consider upgrading.`
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3 ml-4">
          <Link href="/subscription">
            <Button size="sm" variant={isAtLimit ? "default" : "outline"}>
              <Crown className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}