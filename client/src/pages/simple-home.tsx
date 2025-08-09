import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, LogOut } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { signOut } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SimpleHome() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-white">
            <h1 className="text-3xl font-bold">Welcome to BittieTasks</h1>
            <p className="text-lg opacity-90">
              {user?.email ? `Hello, ${user.email}!` : 'Welcome back!'}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-purple-600"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Your Earnings
              </CardTitle>
              <CardDescription className="text-white/80">
                Track your income from shared tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-sm text-white/70">Start sharing tasks to earn!</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Active Tasks
              </CardTitle>
              <CardDescription className="text-white/80">
                Tasks you're currently sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-sm text-white/70">Create your first task!</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                This Week
              </CardTitle>
              <CardDescription className="text-white/80">
                Your activity summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">New!</div>
              <p className="text-sm text-white/70">Welcome to BittieTasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Start Earning Today</CardTitle>
              <CardDescription>
                Share your daily routines and earn money from neighbors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Create Your First Task
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Join Community Tasks</CardTitle>
              <CardDescription>
                Find tasks shared by your neighbors and join in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full"
              >
                Browse Available Tasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}