import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

function App() {
  console.log('🎯 Ultra minimal app - NO API CALLS ALLOWED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500">
      <div className="container mx-auto px-4 py-16 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">BittieTasks</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">Little Tasks, Real Income</p>
        <p className="text-lg mb-12 max-w-2xl mx-auto">
          Turn your daily routines into income by sharing household tasks with neighbors. 
          Earn $200-600/week doing what you already do.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3"
          >
            Start Earning Today
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <DollarSign className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Earn Real Money</h3>
          <p className="text-sm opacity-90">
            Get paid for sharing everyday tasks like grocery runs and errands
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;