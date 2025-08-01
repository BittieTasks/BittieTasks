import { Clock, Star, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const getCategoryColor = (categoryId: string) => {
    // This would ideally be derived from the category data
    // For now, using a simple hash-based approach
    const colors = ["blue", "green", "yellow", "purple"];
    const index = categoryId.length % colors.length;
    return colors[index];
  };

  const categoryColor = getCategoryColor(task.categoryId || "");

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 task-card-hover">
      <div className="flex items-start space-x-3">
        {task.imageUrl && (
          <img 
            src={task.imageUrl} 
            alt={task.title}
            className="w-16 h-16 rounded-lg object-cover" 
          />
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
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
              <span className="text-lg font-bold text-green-600">${task.payment}</span>
              <p className="text-xs text-gray-500">per task</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`text-${categoryColor}-700 border-${categoryColor}-200`}>
              Task
            </Badge>
            <Badge variant="outline" className="text-gray-700">
              {task.completions || 0} completed
            </Badge>
          </div>
          <Link href={`/task/${task.id}`}>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
