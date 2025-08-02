import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Zap, Trophy, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  rewardPoints: number;
  icon: string;
  color: string;
  estimatedMinutes: number;
}

interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  assignedDate: string;
  completedAt: string | null;
  status: "assigned" | "completed" | "skipped";
  reflection: string | null;
  pointsEarned: number;
  challenge?: Challenge;
}

export default function DailyChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<UserChallenge | null>(null);
  const [reflection, setReflection] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user ID from session/auth (placeholder for now)
  const currentUserId = "demo-user-id";

  const { data: todaysChallenges = [], isLoading } = useQuery({
    queryKey: ["/api/challenges/today", currentUserId],
    queryFn: () => fetch(`/api/challenges/today/${currentUserId}`).then(res => res.json())
  });

  const completChallengeMutation = useMutation({
    mutationFn: async ({ userChallengeId, reflection }: { userChallengeId: string; reflection?: string }) => {
      return apiRequest(`/api/challenges/${userChallengeId}/complete`, "POST", { reflection });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Challenge Completed!",
        description: `You earned ${data.pointsEarned || 0} points! Keep up the great work.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/today", currentUserId] });
      setShowCompletionModal(false);
      setReflection("");
      setSelectedChallenge(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCompleteChallenge = (userChallenge: UserChallenge) => {
    setSelectedChallenge(userChallenge);
    setShowCompletionModal(true);
  };

  const submitCompletion = () => {
    if (selectedChallenge) {
      completChallengeMutation.mutate({
        userChallengeId: selectedChallenge.id,
        reflection: reflection.trim() || undefined
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const completedCount = todaysChallenges.filter((uc: UserChallenge) => uc.status === "completed").length;
  const totalPoints = todaysChallenges.reduce((sum: number, uc: UserChallenge) => sum + uc.pointsEarned, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Challenges</h1>
          <p className="text-gray-600 mt-1">Small steps to boost your wellness and motivation</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{totalPoints} pts</div>
          <div className="text-sm text-gray-500">Today's points</div>
        </div>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold">Today's Progress</span>
              </div>
              <Badge variant="secondary">
                {completedCount} of {todaysChallenges.length} completed
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="text-lg font-semibold">{totalPoints} points earned</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Challenge Progress</span>
              <span>{Math.round((completedCount / todaysChallenges.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / todaysChallenges.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {todaysChallenges.map((userChallenge: UserChallenge) => {
          const challenge = userChallenge.challenge;
          if (!challenge) return null;

          const isCompleted = userChallenge.status === "completed";

          return (
            <Card key={userChallenge.id} className={`transition-all duration-200 hover:shadow-lg ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{challenge.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription className="text-sm">{challenge.description}</CardDescription>
                    </div>
                  </div>
                  {isCompleted && <CheckCircle className="h-6 w-6 text-green-600" />}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{challenge.estimatedMinutes}min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-purple-600">
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold">{challenge.rewardPoints} points</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {challenge.category}
                  </Badge>
                </div>

                {isCompleted ? (
                  <div className="space-y-2">
                    <div className="text-center text-green-600 font-semibold">
                      ✓ Completed!
                    </div>
                    {userChallenge.reflection && (
                      <div className="text-xs text-gray-600 italic p-2 bg-gray-50 rounded">
                        "{userChallenge.reflection}"
                      </div>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleCompleteChallenge(userChallenge)}
                    className="w-full"
                    variant="default"
                  >
                    Mark Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{selectedChallenge.challenge?.icon}</span>
                <span>Complete Challenge</span>
              </CardTitle>
              <CardDescription>
                {selectedChallenge.challenge?.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  How did it go? (Optional)
                </label>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Share your thoughts about completing this challenge..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompletionModal(false);
                    setReflection("");
                    setSelectedChallenge(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitCompletion}
                  disabled={completChallengeMutation.isPending}
                  className="flex-1"
                >
                  {completChallengeMutation.isPending ? "Completing..." : "Complete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {todaysChallenges.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges yet</h3>
            <p className="text-gray-600">Check back later for today's challenges!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}