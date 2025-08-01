import { TrendingUp } from "lucide-react";
import type { UserStats } from "@shared/schema";

interface EarningsOverviewProps {
  stats: UserStats;
}

export default function EarningsOverview({ stats }: EarningsOverviewProps) {
  const todayEarnings = parseFloat(stats.todayEarnings);
  const yesterdayEarnings = todayEarnings - 12.50; // Mock calculation
  const increase = todayEarnings - yesterdayEarnings;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">Today's Earnings</span>
        <TrendingUp className="text-secondary-500" size={16} />
      </div>
      <div className="flex items-end space-x-4">
        <div>
          <span className="text-3xl font-bold text-gray-900">
            ${stats.todayEarnings}
          </span>
          <p className="text-sm text-secondary-600 font-medium">
            +${increase.toFixed(2)} from yesterday
          </p>
        </div>
        <div className="flex-1">
          <div className="flex items-end space-x-1 h-8">
            <div className="w-2 bg-secondary-200 rounded-t h-3"></div>
            <div className="w-2 bg-secondary-300 rounded-t h-5"></div>
            <div className="w-2 bg-secondary-400 rounded-t h-4"></div>
            <div className="w-2 bg-secondary-500 rounded-t h-8"></div>
            <div className="w-2 bg-secondary-600 rounded-t h-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
