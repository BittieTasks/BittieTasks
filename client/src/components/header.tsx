import { Bell, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function Header() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/profile"],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
  });

  return (
    <header className="glass-effect sticky top-0 z-40 px-4 py-3 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Home className="text-white text-sm" size={16} />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">BittieTasks</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="text-gray-400 text-lg" size={20} />
            {unreadCount && unreadCount.count > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount.count}
              </span>
            )}
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : "U"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
