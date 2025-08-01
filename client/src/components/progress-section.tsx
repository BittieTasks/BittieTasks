import { Trophy, Star, Medal } from "lucide-react";
import type { UserStats } from "@shared/schema";

interface ProgressSectionProps {
  stats: UserStats;
}

export default function ProgressSection({ stats }: ProgressSectionProps) {
  const circumference = 2 * Math.PI * 15.91549430918954;
  const offset = circumference - (stats.weeklyProgress / 100) * circumference;

  return (
    <section className="px-4 py-4 mb-20">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Progress</h3>
      
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-4 text-white mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold mb-1">Weekly Goal</h4>
            <p className="text-sm opacity-90">
              ${stats.todayEarnings} of ${stats.weeklyGoal} earned
            </p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="progress-ring w-16 h-16" viewBox="0 0 42 42">
              <circle 
                cx="21" 
                cy="21" 
                r="15.91549430918954" 
                fill="transparent" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="2"
              />
              <circle 
                cx="21" 
                cy="21" 
                r="15.91549430918954" 
                fill="transparent" 
                stroke="white" 
                strokeWidth="2" 
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round" 
                className="progress-ring-circle"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{stats.weeklyProgress}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="text-accent-600" size={16} />
          </div>
          <p className="text-xs font-medium text-gray-700 mb-1">Tasks Done</p>
          <p className="text-lg font-bold text-gray-900">{stats.tasksCompleted}</p>
        </div>
        
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="text-primary-600" size={16} />
          </div>
          <p className="text-xs font-medium text-gray-700 mb-1">Avg Rating</p>
          <p className="text-lg font-bold text-gray-900">{stats.averageRating}</p>
        </div>
        
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Medal className="text-secondary-600" size={16} />
          </div>
          <p className="text-xs font-medium text-gray-700 mb-1">Streak</p>
          <p className="text-lg font-bold text-gray-900">{stats.currentStreak} days</p>
        </div>
      </div>
    </section>
  );
}
