import { Button } from "@/components/ui/button";
import { DollarSign, Users, Calendar } from "lucide-react";

export default function MinimalLanding() {
  console.log('🏠 Minimal landing render');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            BittieTasks
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Little Tasks, Real Income
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            Turn your daily routines into income by sharing household tasks with neighbors. 
            Earn $200-600/week doing what you already do.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3"
              onClick={() => window.location.href = '/auth'}
            >
              Start Earning Today
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-purple-600 font-semibold px-8 py-3"
              onClick={() => window.location.href = '/auth'}
            >
              Sign In to Dashboard
            </Button>
          </div>
          
          <div className="mb-16">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/debug'}
              className="border-white/50 text-white/80 hover:bg-white hover:text-purple-600"
            >
              Debug Authentication
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <DollarSign className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Earn Real Money</h3>
              <p className="text-sm opacity-90">
                Get paid for sharing everyday tasks like grocery runs and errands
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Build Community</h3>
              <p className="text-sm opacity-90">
                Connect with neighbors and create lasting local relationships
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Flexible Schedule</h3>
              <p className="text-sm opacity-90">
                Work around your schedule - no commitments, just opportunities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}