import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Calendar, Star, Shield, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function LandingPage() {
  console.log('🏠 Landing page render');
  
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('Authenticated user detected, redirecting to home');
      setLocation('/');
    }
  }, [user, loading, setLocation]);
  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 text-white px-6 py-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <DollarSign className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">BittieTasks</h1>
          <p className="text-blue-100 font-medium">Turn daily routines into steady income</p>
          <div className="mt-4 text-sm text-blue-200">
            $200-600/week • 10,000+ parents earning
          </div>
        </div>
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

        {/* Main Call to Action */}
        <div className="space-y-3 mb-8">
          <Link href="/auth">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
              Start Earning Today
            </Button>
          </Link>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Already a member?</p>
            <Link href="/auth">
              <Button variant="outline" className="w-full py-3 px-6 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium rounded-xl transition-all duration-200">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/subscription">
            <Button variant="outline" className="w-full py-3 px-4 text-sm border-purple-500 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200">
              View Plans
            </Button>
          </Link>
          
          <Link href="/how-it-works">
            <Button variant="outline" className="w-full py-3 px-4 text-sm border-green-500 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200">
              How It Works
            </Button>
          </Link>
        </div>

        {/* Business Partnership - Smaller */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Link href="/company-application">
            <Button variant="ghost" className="w-full text-xs py-2 px-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
              Corporate Partners
            </Button>
          </Link>
          
          <Link href="/advertising-portal">
            <Button variant="ghost" className="w-full text-xs py-2 px-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200">
              Advertise
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-600">
            <div className="flex flex-col items-center">
              <Star className="text-yellow-500 fill-current mb-1" size={16} />
              <span className="font-medium">4.8★</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="text-blue-500 mb-1" size={16} />
              <span className="font-medium">10K+ users</span>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="text-green-500 mb-1" size={16} />
              <span className="font-medium">$2M+ earned</span>
            </div>
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