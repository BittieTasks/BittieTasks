import { Home, Search, Wallet, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
  });

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        <Link href="/">
          <button className={`flex flex-col items-center py-2 px-3 ${
            isActive("/") ? "text-primary-600" : "text-gray-400"
          }`}>
            <Home size={20} className="mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
        </Link>
        
        <Link href="/search">
          <button className={`flex flex-col items-center py-2 px-3 ${
            isActive("/search") ? "text-primary-600" : "text-gray-400"
          }`}>
            <Search size={20} className="mb-1" />
            <span className="text-xs font-medium">Search</span>
          </button>
        </Link>
        
        <Link href="/earnings">
          <button className={`flex flex-col items-center py-2 px-3 ${
            isActive("/earnings") ? "text-primary-600" : "text-gray-400"
          }`}>
            <Wallet size={20} className="mb-1" />
            <span className="text-xs font-medium">Earnings</span>
          </button>
        </Link>
        
        <Link href="/messages">
          <button className={`flex flex-col items-center py-2 px-3 relative ${
            isActive("/messages") ? "text-primary-600" : "text-gray-400"
          }`}>
            <MessageCircle size={20} className="mb-1" />
            <span className="text-xs font-medium">Messages</span>
            {unreadCount && unreadCount.count > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
            )}
          </button>
        </Link>
        
        <Link href="/profile">
          <button className={`flex flex-col items-center py-2 px-3 ${
            isActive("/profile") ? "text-primary-600" : "text-gray-400"
          }`}>
            <User size={20} className="mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </Link>
      </div>
    </nav>
  );
}
