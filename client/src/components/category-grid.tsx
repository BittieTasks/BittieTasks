import { useQuery } from "@tanstack/react-query";
import { Utensils, Fan, Baby, Package } from "lucide-react";
import type { Category } from "@shared/schema";

const iconMap = {
  "fas fa-utensils": Utensils,
  "fas fa-broom": Fan,
  "fas fa-baby": Baby,
  "fas fa-boxes": Package,
};

const colorMap = {
  primary: "bg-primary-100 text-primary-600",
  secondary: "bg-secondary-100 text-secondary-600",
  accent: "bg-accent-100 text-accent-600",
  purple: "bg-purple-100 text-purple-600",
};

interface CategoryGridProps {
  onCategorySelect?: (categoryId: string) => void;
}

export default function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center p-3 bg-gray-200 rounded-xl animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded-full mb-2"></div>
            <div className="w-16 h-3 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((category) => {
        const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Package;
        const colorClass = colorMap[category.color as keyof typeof colorMap] || "bg-gray-100 text-gray-600";
        
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect?.(category.id)}
            className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 task-card-hover"
          >
            <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center mb-2`}>
              <IconComponent size={20} />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
