import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle,
  Heart,
  MapPin
} from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600">BittieTasks</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Turn your daily tasks into earning opportunities. Share activities with neighbors, 
            split costs, and build community while making money together.
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Button size="lg" className="px-8" onClick={() => window.location.href = '/registration'}>
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="px-8" onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </div>
          
          <div className="flex justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Community focused</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-16">
          <Card className="text-center border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Earn Together</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Share costs for tasks like grocery runs, school pickups, or home projects. 
                Everyone saves money while building community connections.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Build Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with neighbors and parents in your area. Turn routine activities 
                into social opportunities that strengthen your local community.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Safe & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                All payments processed securely through Stripe. Verified profiles and 
                ratings system ensure trust and safety for all community members.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How BittieTasks Works
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create or Join Tasks</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Post tasks you need help with or join existing ones in your neighborhood. 
                From grocery runs to school pickups.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Split Costs & Connect</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share expenses with other participants. Everyone saves money while 
                building meaningful community relationships.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Earn & Save</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get paid for organizing tasks or save money by joining them. 
                Build reputation and unlock premium earning opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Plans Preview */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Free Starter</CardTitle>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500">10% platform fee</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">5 tasks per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Basic support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Community access</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Pro Earner</CardTitle>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-bold">$9.99</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500">7% platform fee</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">50 tasks per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Ad-free experience</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  Premium Host
                  <Star className="w-4 h-4 text-yellow-500" />
                </CardTitle>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-bold">$19.99</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500">5% platform fee</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Unlimited tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">24/7 support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Exclusive features</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Join thousands of parents already making money through community tasks
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                className="px-8"
                onClick={() => window.location.href = '/registration'}
              >
                Create Your Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}