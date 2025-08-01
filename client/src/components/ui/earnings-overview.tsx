import { TrendingUp } from "lucide-react";
import type { User } from "@shared/schema";

interface EarningsOverviewProps {
  user?: User;
}

export default function EarningsOverview({ user }: EarningsOverviewProps) {
  const todayEarnings = user?.totalEarnings || "0.00";
  const yesterdayEarnings = "35.00"; // Mock data - in real app, calculate from completions

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">Today's Earnings</span>
        <TrendingUp className="text-green-500" size={16} />
      </div>
      <div className="flex items-end space-x-4">
        <div>
          <span className="text-3xl font-bold text-gray-900">${todayEarnings}</span>
          <p className="text-sm text-green-600 font-medium">
            +${(parseFloat(todayEarnings) - parseFloat(yesterdayEarnings)).toFixed(2)} from yesterday
          </p>
        </div>
        <div className="flex-1">
          {/* Simple earnings visualization */}
          <div className="flex items-end space-x-1 h-8">
            <div className="w-2 bg-green-200 rounded-t h-3"></div>
            <div className="w-2 bg-green-300 rounded-t h-5"></div>
            <div className="w-2 bg-green-400 rounded-t h-4"></div>
            <div className="w-2 bg-green-500 rounded-t h-8"></div>
            <div className="w-2 bg-green-600 rounded-t h-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
