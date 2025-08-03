import { Link, useLocation } from "wouter";
import { Home, Search, Plus, MessageCircle, User, Trophy } from "lucide-react";
import { ARIA_LABELS } from "@/lib/accessibility";

const AccessibleBottomNavigation = () => {
  const [location] = useLocation();
  
  const navItems = [
    { 
      path: "/", 
      icon: Home, 
      label: "Home",
      ariaLabel: "Navigate to home page"
    },
    { 
      path: "/search", 
      icon: Search, 
      label: "Browse",
      ariaLabel: "Browse available tasks"
    },
    { 
      path: "/create-task", 
      icon: Plus, 
      label: "Create",
      ariaLabel: "Create new task"
    },
    { 
      path: "/messages", 
      icon: MessageCircle, 
      label: "Messages",
      ariaLabel: "View messages"
    },
    { 
      path: "/achievements", 
      icon: Trophy, 
      label: "Wellness",
      ariaLabel: "View wellness achievements"
    },
    { 
      path: "/profile", 
      icon: User, 
      label: "Profile",
      ariaLabel: "View profile"
    }
  ];

  return (
    <nav 
      id="bottom-navigation"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 safe-area-pb max-w-md mx-auto"
      role="navigation"
      aria-label={ARIA_LABELS.bottomNavigation}
    >
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label, ariaLabel }) => {
          const isActive = location === path || (path !== "/" && location.startsWith(path));
          
          return (
            <Link
              key={path}
              href={path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
              aria-label={ariaLabel}
              aria-current={isActive ? "page" : undefined}
              role="link"
            >
              <Icon 
                className="h-5 w-5 mb-1" 
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AccessibleBottomNavigation;