import { Home, Search, DollarSign, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "wouter";

interface BottomNavigationProps {
  currentPath: string;
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/earnings", icon: DollarSign, label: "Earnings" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <button
                className={`flex flex-col items-center py-2 px-3 relative ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{label}</span>
                {label === "Messages" && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
