import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Star, Award, Calendar, Settings, DollarSign, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/ui/bottom-navigation";
import type { User } from "@shared/schema";

export default function ProfilePage() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/current"]
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <Settings size={20} />
          </Button>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user?.firstName?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="opacity-90">@{user?.username}</p>
              <div className="flex items-center mt-2">
                <Star size={16} className="mr-1" />
                <span className="font-medium">{user?.rating || "0.0"}</span>
                <span className="mx-2">•</span>
                <span>{user?.completedTasks || 0} tasks completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Earning Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Earning Model</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
              <div className="text-sm font-medium text-blue-700">App Pays</div>
              <div className="text-lg font-bold text-blue-600">$180</div>
              <div className="text-xs text-gray-500">per week</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-green-200">
              <div className="text-sm font-medium text-green-700">Neighbors Pay</div>
              <div className="text-lg font-bold text-green-600">$395</div>
              <div className="text-xs text-gray-500">per week</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-2 text-white text-center">
            <div className="text-sm opacity-90">Total Potential</div>
            <div className="text-xl font-bold">$575/week</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{user?.completedTasks || 0}</div>
            <div className="text-xs text-gray-500">Tasks Done</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">${user?.totalEarnings || "0.00"}</div>
            <div className="text-xs text-gray-500">Total Earned</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="flex items-center justify-center">
              <Star size={20} className="text-yellow-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900">{user?.rating || "0.0"}</span>
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>

        {/* Skills & Interests */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Skills & Interests</h4>
          <div className="flex flex-wrap gap-2">
            {(user?.skills || ['Meal Prep', 'Childcare', 'Organization', 'Cleaning']).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">About</h4>
            <Button variant="ghost" size="sm">
              <Edit size={16} />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {user?.bio || "Dedicated parent looking to help other families while earning extra income. I love organizing, meal prep, and creating efficient systems that make family life easier."}
          </p>
        </div>

        {/* Achievement Badges */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Achievements</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="text-yellow-600" size={20} />
              </div>
              <div className="text-xs font-medium text-gray-900">First Task</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            
            <div className="text-center opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="text-gray-400" size={20} />
              </div>
              <div className="text-xs font-medium text-gray-900">5-Star Pro</div>
              <div className="text-xs text-gray-500">Locked</div>
            </div>
            
            <div className="text-center opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="text-gray-400" size={20} />
              </div>
              <div className="text-xs font-medium text-gray-900">Weekly Hero</div>
              <div className="text-xs text-gray-500">Locked</div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Edit className="mr-2" size={16} />
            Edit Profile
          </Button>
          
          <Link href="/earnings">
            <Button variant="outline" className="w-full justify-start">
              <Award className="mr-2" size={16} />
              View Earnings
            </Button>
          </Link>
          
          <Link href="/compliance">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2" size={16} />
              Legal Compliance
            </Button>
          </Link>
          
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2" size={16} />
            Account Settings
          </Button>
        </div>
      </div>

      <BottomNavigation currentPath="/profile" />
    </div>
  );
}