import { Clock, Star, User } from "lucide-react";
import { Link } from "wouter";
import type { TaskWithCategory } from "@shared/schema";

interface TaskCardProps {
  task: TaskWithCategory;
}

const colorMap = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  accent: "bg-accent-100 text-accent-700",
  purple: "bg-purple-100 text-purple-700",
};

export default function TaskCard({ task }: TaskCardProps) {
  const categoryColor = colorMap[task.category.color as keyof typeof colorMap] || "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 task-card-hover">
      <div className="flex items-start space-x-3">
        <img 
          src={task.imageUrl || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"} 
          alt={task.title}
          className="w-16 h-16 rounded-lg object-cover" 
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {task.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {task.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {task.duration} min
                </span>
                <span className="flex items-center">
                  <Star size={12} className="mr-1" />
                  {task.rating}
                </span>
                <span className="flex items-center">
                  <User size={12} className="mr-1" />
                  {task.difficulty}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-secondary-600">
                ${task.payment}
              </span>
              <p className="text-xs text-gray-500">per task</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 ${categoryColor} text-xs font-medium rounded-full`}>
              {task.category.name}
            </span>
            <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full">
              Photo/Video
            </span>
          </div>
          <Link href={`/task/${task.id}`}>
            <button className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors">
              Start Task
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
