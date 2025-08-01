import { ArrowLeft, DollarSign, Users, Shield, TrendingUp, Percent, Award, Clock, Star, Home } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen relative">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-40 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="text-gray-600" size={20} />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">How TaskParent Works</h1>
        </div>
      </header>

      <div className="px-4 py-6 mb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Get Paid for What You're Already Doing
          </h2>
          <p className="text-gray-600 mb-4">
            TaskParent lets parents monetize their daily routines. Already cooking dinner? 
            Grocery shopping? Organizing your closet? Share the benefit with neighbors and get paid!
          </p>
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <DollarSign className="text-green-600 mr-2" size={20} />
              <span className="font-semibold text-gray-900">
                Turn your daily tasks into $200-600 extra income per week
              </span>
            </div>
          </div>
        </div>

        {/* Dual Earning Model */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Home className="text-green-600 mr-2" size={24} />
            Two Ways to Earn Money
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                <DollarSign className="text-blue-600 mr-2" size={20} />
                Get Paid by the App
              </h4>
              <p className="text-gray-700 mb-4 text-sm">
                Earn money directly from TaskParent for doing your own daily tasks. 
                Just document what you're already doing!
              </p>
              
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center justify-between">
                  <span>• Do your own laundry</span>
                  <span className="font-medium">$15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Cook family dinner</span>
                  <span className="font-medium">$25</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Clean your living room</span>
                  <span className="font-medium">$20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Meal prep for your family</span>
                  <span className="font-medium">$35</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-green-800 mb-3 flex items-center">
                <Users className="text-green-600 mr-2" size={20} />
                Help Other Parents
              </h4>
              <p className="text-gray-700 mb-4 text-sm">
                Share your tasks with neighbors and earn extra income. They pay you 
                to join what you're already doing!
              </p>
              
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center justify-between">
                  <span>• 3 families join meal prep</span>
                  <span className="font-medium">$105</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Costco run for 2 neighbors</span>
                  <span className="font-medium">$50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Group childcare (4 kids)</span>
                  <span className="font-medium">$140</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Organization consulting</span>
                  <span className="font-medium">$85</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-4 text-white text-center">
            <h4 className="font-bold mb-2">Complete Example: Sunday Meal Prep</h4>
            <div className="text-sm opacity-90">
              App pays you <strong>$35</strong> for doing your own meal prep + 
              3 neighbors pay <strong>$35 each</strong> to join = <strong>$140 total</strong> for one task!
            </div>
          </div>
        </section>

        {/* Revenue Model */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="text-blue-600 mr-2" size={24} />
            Our Revenue Model
          </h3>
          
          <div className="space-y-4">
            {/* Service Fee */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Percent className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Platform Service Fee</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    We charge a small 15% service fee on completed tasks. This covers:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Payment processing and security</li>
                    <li>Insurance coverage for all tasks</li>
                    <li>24/7 customer support</li>
                    <li>Platform maintenance and development</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Premium Memberships */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <Award className="text-yellow-600" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Premium Memberships</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    TaskParent Pro ($9.99/month) offers enhanced features:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Priority access to high-paying tasks</li>
                    <li>Reduced platform fees (10% instead of 15%)</li>
                    <li>Advanced scheduling tools</li>
                    <li>Detailed analytics and earnings insights</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Corporate Partnerships */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Corporate Partnerships</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    We partner with businesses to offer employee benefits:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    <li>Meal prep services for busy employees</li>
                    <li>Event planning and organizing</li>
                    <li>Eldercare assistance programs</li>
                    <li>Corporate childcare support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="text-green-600 mr-2" size={24} />
            How It Works
          </h3>
          
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white mb-4">
            <h4 className="font-bold text-lg mb-2">Turn Your Daily Routine Into Income</h4>
            <p className="text-sm opacity-90">
              Already doing it anyway? Share the benefit with neighbors and get paid!
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                1
              </div>
              <span className="text-gray-800">Post what you're already planning to do</span>
            </div>
            <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                2
              </div>
              <span className="text-gray-800">Neighbors join and pay to share the benefit</span>
            </div>
            <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                3
              </div>
              <span className="text-gray-800">Do your task + earn money doing it</span>
            </div>
          </div>
        </section>

        {/* Premium Tasks - New Feature */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Star className="text-purple-600 mr-2" size={24} />
            NEW: Premium Tasks - Higher Earnings!
          </h3>
          
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white mb-4">
            <h4 className="font-bold text-lg mb-2">Scale Your Existing Tasks for Higher Pay!</h4>
            <p className="text-sm opacity-90">
              Turn your successful shared tasks into premium services. When you prove your expertise, 
              you can charge higher rates and serve more families with the same routine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h5 className="font-bold text-purple-800 mb-2">Premium Task Examples</h5>
              <div className="space-y-2 text-sm text-purple-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Premium meal prep service - $75/family
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Professional childcare hub - $50/child
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Complete organization service - $120
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Family budget consulting - $85
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h5 className="font-bold text-green-800 mb-2">How to Unlock Premium</h5>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  4.5+ star average rating
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  10+ completed tasks
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Positive neighbor reviews
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Category expertise verified
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Model Section */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Percent className="text-blue-600 mr-2" size={24} />
            How TaskParent Makes Money (So You Get Paid!)
          </h3>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-gray-700 mb-4">
              We believe in full transparency about how our business works. TaskParent is 100% self-sustaining through app-based revenue - 
              no dependence on external brands or sponsors needed!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">Platform Service Fee</h4>
                <p className="text-blue-800 text-sm mb-2">15% commission on completed tasks</p>
                <p className="text-gray-600 text-xs">
                  We take a small percentage to maintain the platform, handle payments, provide customer support, and ensure safety.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">TaskParent Pro</h4>
                <p className="text-blue-800 text-sm mb-2">$9.99/month premium membership</p>
                <p className="text-gray-600 text-xs">
                  Reduced fees (10%), priority task placement, advanced analytics, unlimited task posts, and premium customer support.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">Corporate Partnerships</h4>
                <p className="text-blue-800 text-sm mb-2">Employee benefit programs</p>
                <p className="text-gray-600 text-xs">
                  Companies pay us to offer TaskParent as an employee benefit, helping working parents in their workforce earn extra income.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">Premium Features & Tools</h4>
                <p className="text-blue-800 text-sm mb-2">Enhanced platform capabilities</p>
                <p className="text-gray-600 text-xs">
                  Advanced scheduling tools, bulk task management, earnings analytics, tax reporting, and business tools for power users.
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-green-100 rounded-lg p-4 border border-green-300">
              <div className="flex items-center mb-2">
                <Shield className="text-green-600 mr-2" size={20} />
                <h4 className="font-bold text-green-800">100% Self-Sustaining Model</h4>
              </div>
              <p className="text-green-700 text-sm">
                Our app-based revenue streams ensure complete independence from external sponsors. This means reliable platform operation, 
                consistent payments to parents, and continuous feature development - all funded by the value we create for our community.
              </p>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="text-purple-600 mr-2" size={24} />
            Trust & Safety
          </h3>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-800 text-sm">All users are background checked</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-800 text-sm">$1M liability insurance on all tasks</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-800 text-sm">Secure payment processing with escrow</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-800 text-sm">24/7 support and dispute resolution</span>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Success Stories</h3>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-400">
              <p className="text-gray-700 text-sm mb-2">
                "I was already meal prepping every Sunday. Now 4 families join my premium service and I earn $300 every week 
                just doing what I was already doing for my family!"
              </p>
              <p className="text-yellow-700 font-medium text-sm">- Sarah M., Mom of 2</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
              <p className="text-gray-700 text-sm mb-2">
                "My Costco runs used to be a chore. Now I take orders from 6 families and make $150 
                every trip. It's like getting paid to do my own shopping!"
              </p>
              <p className="text-blue-700 font-medium text-sm">- Maria L., Mom of 3</p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-400">
              <p className="text-gray-700 text-sm mb-2">
                "I upgraded to premium tasks after building my reputation! Now I earn $270 per week with my premium meal prep service ($75 × 3 families) 
                plus my regular organization services ($120). Same work, higher pay!"
              </p>
              <p className="text-purple-700 font-medium text-sm">- Jessica R., Mom of 1</p>
            </div>
          </div>
        </section>

        {/* Income Potential Breakdown */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="text-green-600 mr-2" size={24} />
            Your Earning Potential
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3">Weekly App-Paid Tasks</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Personal meal prep ($35)</span>
                  <span className="font-medium">$35</span>
                </div>
                <div className="flex justify-between">
                  <span>Family dinner cooking ($25 × 3)</span>
                  <span className="font-medium">$75</span>
                </div>
                <div className="flex justify-between">
                  <span>Room cleaning ($20 × 2)</span>
                  <span className="font-medium">$40</span>
                </div>
                <div className="flex justify-between">
                  <span>Family laundry ($15 × 2)</span>
                  <span className="font-medium">$30</span>
                </div>
                <div className="border-t border-blue-300 pt-2 flex justify-between font-bold">
                  <span>Weekly Total:</span>
                  <span>$180</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-bold text-green-800 mb-3">Weekly Neighbor-Paid Tasks</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>3 families join meal prep ($35 × 3)</span>
                  <span className="font-medium">$105</span>
                </div>
                <div className="flex justify-between">
                  <span>2 Costco runs ($25 × 2)</span>
                  <span className="font-medium">$50</span>
                </div>
                <div className="flex justify-between">
                  <span>4 kids childcare ($35 × 4)</span>
                  <span className="font-medium">$140</span>
                </div>
                <div className="flex justify-between">
                  <span>Organization consulting ($85)</span>
                  <span className="font-medium">$100</span>
                </div>
                <div className="border-t border-green-300 pt-2 flex justify-between font-bold">
                  <span>Weekly Total:</span>
                  <span>$395</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-white text-center">
            <h4 className="font-bold text-xl mb-2">Combined Weekly Earning Potential</h4>
            <div className="text-3xl font-bold mb-2">$575/week</div>
            <div className="text-lg opacity-90">= $2,300/month = $29,900/year</div>
            <p className="text-sm opacity-80 mt-3">
              All while doing tasks you're already doing for your own family!
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-xl p-6 text-white text-center">
          <h3 className="font-bold text-lg mb-2">Ready to Start Earning?</h3>
          <p className="text-sm opacity-90 mb-4">
            Join thousands of parents already earning money with their everyday skills
          </p>
          <Link href="/" className="inline-block bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Browse Available Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}