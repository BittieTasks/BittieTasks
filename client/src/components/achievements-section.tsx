import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Star, Heart, Users } from "lucide-react";
import AchievementBadge from "@/components/ui/achievement-badge";
import type { AchievementDefinition, UserAchievement } from "@shared/schema";

export default function AchievementsSection() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch user achievements
  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ['/api/achievements/user'],
  });

  // Fetch achievement definitions
  const { data: allAchievements = [] } = useQuery<AchievementDefinition[]>({
    queryKey: ['/api/achievements/definitions'],
  });

  const earnedAchievements = userAchievements.filter(ua => 
    allAchievements.some(def => def.type === ua.achievementType)
  );

  const categories = [
    { id: "all", name: "All", icon: Star },
    { id: "wellness", name: "Wellness", icon: Heart },
    { id: "community", name: "Community", icon: Users },
    { id: "earnings", name: "Earnings", icon: Trophy },
    { id: "engagement", name: "Engagement", icon: Target }
  ];

  const filteredAchievements = allAchievements.filter(achievement => 
    activeCategory === "all" || achievement.category === activeCategory
  );

  const getStatsCards = () => {
    const totalEarned = earnedAchievements.length;
    const totalAvailable = allAchievements.length;
    const completionRate = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;
    
    const rarityCount = earnedAchievements.reduce((acc, ua) => {
      const def = allAchievements.find(a => a.type === ua.achievementType);
      if (def) {
        acc[def.rarity] = (acc[def.rarity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalEarned}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAchievementGrid = (achievements: AchievementDefinition[], showProgress = false) => (
    <div className="grid grid-cols-4 gap-4">
      {achievements.map((achievement) => {
        const userAchievement = userAchievements.find(ua => ua.achievementType === achievement.type);
        return (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            userAchievement={userAchievement}
            showProgress={showProgress}
            size="medium"
          />
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Wellness Achievements
        </h2>
        <Badge variant="outline" className="text-sm">
          {earnedAchievements.length}/{allAchievements.length} Earned
        </Badge>
      </div>

      {getStatsCards()}

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                <Icon size={16} />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {/* Recently Earned */}
            {category.id === "all" && earnedAchievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recently Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {earnedAchievements
                      .sort((a, b) => (b.earnedAt ? new Date(b.earnedAt).getTime() : 0) - (a.earnedAt ? new Date(a.earnedAt).getTime() : 0))
                      .slice(0, 6)
                      .map((userAchievement) => {
                        const achievement = allAchievements.find(a => a.type === userAchievement.achievementType);
                        return achievement ? (
                          <AchievementBadge
                            key={userAchievement.id}
                            achievement={achievement}
                            userAchievement={userAchievement}
                            size="small"
                          />
                        ) : null;
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {category.name === "All" ? "All Achievements" : `${category.name} Achievements`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderAchievementGrid(filteredAchievements, true)}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}