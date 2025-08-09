import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserAchievement, AchievementDefinition } from "@shared/schema";

export function useUserAchievements() {
  return useQuery<UserAchievement[]>({
    queryKey: ['/api/achievements/user'],
  });
}

export function useAchievementDefinitions() {
  return useQuery<AchievementDefinition[]>({
    queryKey: ['/api/achievements/definitions'],
  });
}

export function useCheckAchievements() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiRequest('/api/achievements/check', { method: 'POST' }),
    onSuccess: (data) => {
      // Invalidate user achievements to refetch with new ones
      queryClient.invalidateQueries({ queryKey: ['/api/achievements/user'] });
      
      // Show toast notifications for new achievements
      if (data.newAchievements && data.newAchievements.length > 0) {
        // You can add toast notifications here if needed
        console.log('New achievements earned:', data.newAchievements);
      }
    },
  });
}

export function useAchievementProgress(achievementType: string) {
  const { data: userAchievements } = useUserAchievements();
  const { data: definitions } = useAchievementDefinitions();
  
  const userAchievement = userAchievements?.find(a => a.achievementType === achievementType);
  const definition = definitions?.find(d => d.type === achievementType);
  
  if (!definition) return null;
  
  const isEarned = !!userAchievement;
  const progress = userAchievement?.progress || 0;
  const maxProgress = userAchievement?.maxProgress || (definition.criteria as any)?.requiredCount || 1;
  const progressPercentage = (progress / maxProgress) * 100;
  
  return {
    isEarned,
    progress,
    maxProgress,
    progressPercentage,
    definition,
    userAchievement
  };
}