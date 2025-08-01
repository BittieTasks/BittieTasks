import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Star, Award, Calendar, Settings } from "lucide-react";
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

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold text-lg">$</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Earned</p>
            <p className="font-bold text-gray-900">${user?.totalEarnings || "0.00"}</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star size={20} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
            <p className="font-bold text-gray-900">{user?.rating || "0.0"}</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award size={20} className="text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Streak</p>
            <p className="font-bold text-gray-900">{user?.currentStreak || 0} days</p>
          </div>
        </div>

        {/* Skills */}
        {user?.skills && user.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="capitalize">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Profile Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-12">
            <Edit size={20} className="mr-3" />
            Edit Profile
          </Button>

          <Button variant="outline" className="w-full justify-start h-12">
            <Award size={20} className="mr-3" />
            Achievements
          </Button>

          <Button variant="outline" className="w-full justify-start h-12">
            <Calendar size={20} className="mr-3" />
            Availability Settings
          </Button>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 space-y-1">
              <p>Member since {new Date(user?.createdAt || "").toLocaleDateString()}</p>
              <p>Email: {user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation currentPath="/profile" />
    </div>
  );
}
