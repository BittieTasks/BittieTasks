import { Clock, Star, DollarSign, Award, Building2 } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'shared': return 'bg-blue-100 text-blue-800';
      case 'sponsored': return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if task is sponsored and has brand info
  const isSponsored = task.taskType === 'sponsored' && task.sponsorInfo;
  const sponsorInfo = typeof task.sponsorInfo === 'object' && task.sponsorInfo ? task.sponsorInfo as any : null;

  return (
    <Link href={`/task/${task.id}`}>
      <Card className={`cursor-pointer hover:shadow-md transition-shadow ${isSponsored ? 'border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' : ''}`}>
        <CardContent className="p-4">
          {task.imageUrl && (
            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
              <img 
                src={task.imageUrl} 
                alt={task.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-2">
            {/* Brand info for sponsored tasks */}
            {isSponsored && sponsorInfo?.brandName && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
                  <Building2 size={12} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">{sponsorInfo.brandName}</span>
                </div>
                {sponsorInfo?.specialReward && (
                  <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <Award size={12} className="text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-700">Bonus Reward</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900 text-sm flex-1 overflow-hidden">
                {task.title}
              </h3>
              <div className={`flex items-center font-bold text-sm ml-2 ${isSponsored ? 'text-purple-600' : 'text-green-600'}`}>
                <DollarSign size={14} />
                {task.payment}
                {isSponsored && <span className="text-xs ml-1">+bonus</span>}
              </div>
            </div>
            
            <p className="text-xs text-gray-600 overflow-hidden h-8">
              {task.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-gray-500 text-xs">
                  <Clock size={12} className="mr-1" />
                  {task.duration}min
                </div>
                <div className="flex items-center text-gray-500 text-xs">
                  <Star size={12} className="mr-1 fill-current text-yellow-400" />
                  {task.rating}
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-1 ${getDifficultyColor(task.difficulty)}`}
                >
                  {task.difficulty}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-1 ${getTaskTypeColor(task.taskType)}`}
                >
                  {task.taskType}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}