import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Calendar, Star, Shield, TrendingUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

function DemoLoginButton() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const demoLoginMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/demo", {}),
    onSuccess: (response) => {
      console.log("Demo login success:", response);
      // Wait a moment for cookies to be set, then invalidate queries
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
        toast({
          title: "Demo Access Granted",
          description: "Exploring BittieTasks features with demo account",
        });
        setLocation("/");
      }, 100);
    },
    onError: (error: any) => {
      console.error("Demo login error:", error);
      toast({
        title: "Demo Login Failed",
        description: error.message || "Unable to start demo",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      onClick={() => demoLoginMutation.mutate()}
      disabled={demoLoginMutation.isPending}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
    >
      {demoLoginMutation.isPending ? "Loading Demo..." : "🎯 Try Demo (No Signup)"}
    </Button>
  );
}

export default function LandingPage() {
  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">BittieTasks</h1>
        <p className="text-blue-100">Turn your daily routines into income</p>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Earn $200-600/week sharing what you already do
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Connect with neighbors who want to join your grocery runs, meal prep, 
            and daily activities. Get paid for tasks you're doing anyway.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Community Sharing</h3>
              <p className="text-sm text-gray-600">Let neighbors join your grocery trips, meal prep, and errands</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Flexible Schedule</h3>
              <p className="text-sm text-gray-600">Work around your family's routine and availability</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Secure Payments</h3>
              <p className="text-sm text-gray-600">Safe, escrow-protected payments through the platform</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-yellow-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Real Earnings</h3>
              <p className="text-sm text-gray-600">Average $30 per grocery run, $50 for meal prep sharing</p>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">How it works:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium">1</div>
              <span className="text-gray-700">Post your weekly grocery run for Sunday 2pm</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium">2</div>
              <span className="text-gray-700">3 neighbors pay $10 each to join your trip</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium">3</div>
              <span className="text-gray-700">Earn $30 for something you were doing anyway</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-3">
          <DemoLoginButton />
          <Link href="/auth">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white py-3">
              Get Started - Create Account
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </Link>
          <Link href="/company-application">
            <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
              Corporate Partnership
            </Button>
          </Link>
          <Link href="/advertising-portal">
            <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
              Advertise with Us
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span>4.8/5 rating</span>
            </div>
            <div>10,000+ parents</div>
            <div>$2M+ earned</div>
          </div>
        </div>

        {/* Corporate Partnership Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-800 mb-2">
            <strong>For Companies:</strong> Partner with BittieTasks to engage families through ethical, values-aligned activities.
          </p>
          <p className="text-xs text-blue-600">
            We only partner with companies that meet our strict ethical standards for DEI, LGBTQ+ support, and responsible business practices.
          </p>
        </div>
      </div>
    </div>
  );
}