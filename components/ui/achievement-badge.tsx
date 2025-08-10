import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
// Temporary interfaces for achievement system
interface AchievementDefinition {
  id: string;
  title: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  targetValue: number;
  rewardType: string;
  rewardValue: number;
  rarity?: string;
  color?: string;
}

interface UserAchievement {
  id: string;
  achievementId: string;
  currentValue: number;
  unlockedAt?: Date;
  earnedAt?: Date;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: AchievementDefinition;
  userAchievement?: UserAchievement;
  showProgress?: boolean;
  size?: "small" | "medium" | "large";
}

export default function AchievementBadge({ 
  achievement, 
  userAchievement, 
  showProgress = false,
  size = "medium" 
}: AchievementBadgeProps) {
  const isEarned = !!userAchievement;
  const progress = userAchievement?.progress || 0;
  const maxProgress = userAchievement?.maxProgress || achievement.targetValue || 1;
  const progressPercentage = (progress / maxProgress) * 100;

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-12 h-12 text-lg";
      case "large":
        return "w-20 h-20 text-3xl";
      default:
        return "w-16 h-16 text-2xl";
    }
  };

  const getRarityBorder = () => {
    switch (achievement.rarity) {
      case "legendary":
        return "border-4 border-yellow-400 shadow-lg shadow-yellow-200";
      case "epic":
        return "border-4 border-purple-400 shadow-lg shadow-purple-200";
      case "rare":
        return "border-2 border-blue-400 shadow-md shadow-blue-100";
      default:
        return "border-2 border-gray-300";
    }
  };

  const getBadgeContent = () => (
    <Card className={`${getSizeClasses()} ${getRarityBorder()} ${
      isEarned ? 'opacity-100' : 'opacity-40 grayscale'
    } transition-all duration-200 hover:scale-105`}>
      <CardContent className="p-0 flex items-center justify-center h-full">
        <div 
          className="w-full h-full flex items-center justify-center rounded-lg text-white font-bold"
          style={{ backgroundColor: isEarned ? achievement.color : '#94a3b8' }}
        >
          {achievement.icon}
        </div>
      </CardContent>
    </Card>
  );

  const getTooltipContent = () => (
    <div className="space-y-2 max-w-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{achievement.title}</h4>
        <Badge variant={isEarned ? "default" : "secondary"} className="text-xs">
          {achievement.rarity}
        </Badge>
      </div>
      <p className="text-sm text-gray-600">{achievement.description}</p>
      
      {!isEarned && showProgress && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{progress}/{maxProgress}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}
      
      {isEarned && userAchievement?.earnedAt && (
        <p className="text-xs text-gray-500">
          Earned: {new Date(userAchievement.earnedAt).toLocaleDateString()}
        </p>
      )}
      
      {achievement.rewardValue && achievement.rewardValue > 0 && (
        <div className="flex items-center text-xs text-green-600">
          <span>🎯 +{achievement.rewardValue} {achievement.rewardType}</span>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer">
            {getBadgeContent()}
            {!isEarned && showProgress && progressPercentage > 0 && (
              <div className="mt-1">
                <Progress value={progressPercentage} className="h-1" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-3">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}