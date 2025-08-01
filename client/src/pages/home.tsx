import { useQuery } from "@tanstack/react-query";
import { Bell, Home, Plus, DollarSign, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import BottomNavigation from "@/components/ui/bottom-navigation";
import TaskCard from "@/components/ui/task-card";
import EarningsOverview from "@/components/ui/earnings-overview";
import ProgressRing from "@/components/ui/progress-ring";
import type { User, TaskCategory, Task } from "@shared/schema";

export default function HomePage() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/current"]
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TaskCategory[]>({
    queryKey: ["/api/categories"]
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"]
  });

  if (userLoading || categoriesLoading || tasksLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4 p-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen relative">
      {/* Header Navigation */}
      <header className="glass-effect sticky top-0 z-40 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Home className="text-white" size={16} />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">TaskParent</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="text-gray-400" size={20} />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0] || "U"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="px-4 py-6 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Good morning, {user?.firstName || "Parent"}! 👋
          </h2>
          <p className="text-gray-600">Ready to get paid for what you're already doing?</p>
        </div>
        
        <EarningsOverview user={user} />
      </section>

      {/* Dual Earning Model Highlight */}
      <section className="px-4 py-4 bg-white">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 text-white mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">Get Paid Twice!</h3>
            <DollarSign className="text-white" size={24} />
          </div>
          <p className="text-sm opacity-90 mb-3">
            Earn money from the app for your personal tasks, PLUS extra income when neighbors join you. 
            Same work, double payment!
          </p>
          <Link href="/how-it-works" className="inline-flex items-center text-sm font-medium bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors">
            <TrendingUp size={16} className="mr-2" />
            See How It Works
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <DollarSign className="text-white" size={16} />
            </div>
            <span className="text-xs text-blue-700 font-medium">App Pays You</span>
            <div className="text-xs text-blue-600 mt-1">$180/week</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="text-white" size={16} />
            </div>
            <span className="text-xs text-green-700 font-medium">Neighbors Pay</span>
            <div className="text-xs text-green-600 mt-1">$395/week</div>
          </div>
        </div>
      </section>

      {/* Task Categories */}
      <section className="px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Categories</h3>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/search?category=${category.id}`}>
              <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 task-card-hover cursor-pointer">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  category.color === 'primary' ? 'bg-blue-100' :
                  category.color === 'secondary' ? 'bg-green-100' :
                  category.color === 'accent' ? 'bg-yellow-100' :
                  'bg-purple-100'
                }`}>
                  <i className={`fas ${category.icon} ${
                    category.color === 'primary' ? 'text-blue-600' :
                    category.color === 'secondary' ? 'text-green-600' :
                    category.color === 'accent' ? 'text-yellow-600' :
                    'text-purple-600'
                  }`}></i>
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Task Feed */}
      <section className="px-4 py-4 mb-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Available Tasks</h3>
          <Link href="/search" className="text-blue-600 text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="space-y-4">
          {tasks.slice(0, 3).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </section>

      {/* Achievement Section */}
      <section className="px-4 py-4 mb-20">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Progress</h3>
        
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-4 text-white mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Weekly Goal</h4>
              <p className="text-sm opacity-90">
                ${user?.totalEarnings || "0.00"} of $400 earned this week
              </p>
            </div>
            <ProgressRing 
              progress={Math.min((parseFloat(user?.totalEarnings || "0") / 400) * 100, 100)} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-trophy text-yellow-600 text-sm"></i>
            </div>
            <p className="text-xs font-medium text-gray-700 mb-1">Tasks Done</p>
            <p className="text-lg font-bold text-gray-900">{user?.completedTasks || 0}</p>
          </div>
          
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-star text-blue-600 text-sm"></i>
            </div>
            <p className="text-xs font-medium text-gray-700 mb-1">Avg Rating</p>
            <p className="text-lg font-bold text-gray-900">{user?.rating || "0.0"}</p>
          </div>
          
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-medal text-green-600 text-sm"></i>
            </div>
            <p className="text-xs font-medium text-gray-700 mb-1">Streak</p>
            <p className="text-lg font-bold text-gray-900">{user?.currentStreak || 0} days</p>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <button className="floating-action w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110">
        <Plus size={20} />
      </button>

      <BottomNavigation currentPath="/" />
    </div>
  );
}
