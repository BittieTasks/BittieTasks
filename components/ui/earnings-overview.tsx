import { Coins, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { User } from "@shared/schema";

interface EarningsOverviewProps {
  user?: User;
}

export default function EarningsOverview({ user }: EarningsOverviewProps) {
  const totalEarnings = user?.totalEarnings ? parseFloat(user.totalEarnings) : 0;
  // Using safe fallback values for deployment - these will be connected to real data later
  const completedTasks = 12; // Mock data for now
  const currentStreak = 5; // Mock data for now

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="bg-white">
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
            <Coins size={16} className="text-green-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{totalEarnings.toFixed(0)}</p>
          <p className="text-xs text-gray-600">Total Earned</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{completedTasks}</p>
          <p className="text-xs text-gray-600">Tasks Done</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-2">
            <Calendar size={16} className="text-orange-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{currentStreak}</p>
          <p className="text-xs text-gray-600">Day Streak</p>
        </CardContent>
      </Card>
    </div>
  );
}