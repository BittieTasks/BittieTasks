import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Copy, Users, DollarSign, Gift, Trophy, Calendar, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ReferralsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: referralStats, isLoading } = useQuery({
    queryKey: ["/api/referrals/stats"]
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/referrals/leaderboard"]
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/referrals/generate-code", {});
    },
    onSuccess: (data) => {
      toast({
        title: "Referral Code Generated",
        description: `Your referral code is ${data.referralCode}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate referral code",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareOptions = [
    {
      name: "Text Message",
      action: () => {
        const message = `Join TaskParent and earn money for daily tasks! Use my referral code ${referralStats?.referralCode} to get $5 bonus: ${referralStats?.referralLink}`;
        window.open(`sms:?body=${encodeURIComponent(message)}`);
      }
    },
    {
      name: "Email",
      action: () => {
        const subject = "Join TaskParent - Get $5 Bonus!";
        const body = `Hi! I've been using TaskParent to earn money from daily household tasks and thought you'd love it too.\n\nUse my referral code ${referralStats?.referralCode} when you sign up to get a $5 bonus after your first completed task!\n\nSign up here: ${referralStats?.referralLink}\n\nTaskParent lets parents earn $200-600/week by sharing routine tasks like grocery runs and meal prep with neighbors. It's been amazing for our family's budget!\n\nLet me know if you have any questions!`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      }
    },
    {
      name: "Social Media",
      action: () => {
        const message = `Just discovered TaskParent - earning money for daily tasks I'm already doing! 💰✨ Use code ${referralStats?.referralCode} for $5 bonus: ${referralStats?.referralLink} #TaskParent #MomHustle #ExtraIncome`;
        copyToClipboard(message);
      }
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Refer Friends & Earn More
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share TaskParent with friends and family. You both earn money when they join!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {referralStats?.referralCount || 0}
              </div>
              <div className="text-sm text-gray-600">Total Referrals</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                ${referralStats?.totalEarnings || "0.00"}
              </div>
              <div className="text-sm text-gray-600">Referral Earnings</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {referralStats?.pendingReferrals || 0}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {referralStats?.completedReferrals || 0}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share">Share & Earn</TabsTrigger>
            <TabsTrigger value="activity">My Referrals</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6">
            {/* Referral Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Your Referral Code
                </CardTitle>
                <CardDescription>
                  Share this code with friends to earn $10 for each person who joins and completes their first task
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {referralStats?.referralCode ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={referralStats.referralCode}
                        readOnly
                        className="text-center text-2xl font-bold tracking-wider"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(referralStats.referralCode)}
                      >
                        {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        value={referralStats.referralLink}
                        readOnly
                        className="text-sm"
                        placeholder="Referral link will appear here"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(referralStats.referralLink)}
                      >
                        {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">Generate your unique referral code to start earning</p>
                    <Button
                      onClick={() => generateCodeMutation.mutate()}
                      disabled={generateCodeMutation.isPending}
                    >
                      {generateCodeMutation.isPending ? "Generating..." : "Generate Referral Code"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How Referrals Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">1. Share Your Code</h3>
                    <p className="text-sm text-gray-600">Send your referral code to friends and family</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">2. They Sign Up</h3>
                    <p className="text-sm text-gray-600">They join TaskParent using your code and get $5 bonus</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">3. You Both Earn</h3>
                    <p className="text-sm text-gray-600">You get $10 when they complete their first task</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Options */}
            {referralStats?.referralCode && (
              <Card>
                <CardHeader>
                  <CardTitle>Share Your Code</CardTitle>
                  <CardDescription>Choose how you'd like to share TaskParent with others</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {shareOptions.map((option) => (
                      <Button
                        key={option.name}
                        variant="outline"
                        className="h-auto p-4"
                        onClick={option.action}
                      >
                        <div className="text-center">
                          <div className="font-medium">{option.name}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
                <CardDescription>Track your referral progress and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                {referralStats?.recentReferrals?.length > 0 ? (
                  <div className="space-y-4">
                    {referralStats.recentReferrals.map((referral, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{referral.name}</div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {referral.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Badge variant={referral.status === "completed" ? "default" : "secondary"}>
                              {referral.status}
                            </Badge>
                            <span className="font-medium text-green-600">+${referral.reward}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No referrals yet. Start sharing your code to see activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Referral Leaderboard
                </CardTitle>
                <CardDescription>See how you stack up against other TaskParent referrers</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard?.leaderboard && (
                  <>
                    <div className="space-y-3 mb-6">
                      {leaderboard.leaderboard.map((user, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            user.name.includes("You") ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? "bg-yellow-500 text-white" :
                              index === 1 ? "bg-gray-400 text-white" :
                              index === 2 ? "bg-orange-500 text-white" : "bg-gray-200"
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <Badge variant="outline" className="text-xs">
                                {user.badge}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{user.referrals} referrals</div>
                            <div className="text-sm text-green-600">${user.earnings} earned</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {leaderboard.nextMilestone && (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Next Milestone</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Refer {leaderboard.nextMilestone.referrals} people to unlock "{leaderboard.nextMilestone.badge}" 
                          and earn a ${leaderboard.nextMilestone.bonus} bonus!
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(referralStats?.referralCount / leaderboard.nextMilestone.referrals) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}