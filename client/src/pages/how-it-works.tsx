import { ArrowLeft, DollarSign, Users, Shield, TrendingUp, Percent, Award, Clock, Star } from "lucide-react";
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

        {/* Sponsored Tasks - New Feature */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Star className="text-yellow-600 mr-2" size={24} />
            NEW: Sponsored Tasks - Guaranteed Money!
          </h3>
          
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white mb-4">
            <h4 className="font-bold text-lg mb-2">Get Paid Even Without Neighbors!</h4>
            <p className="text-sm opacity-90">
              Document your daily routines and share tips with other parents. Brands sponsor these tasks, 
              so you get paid guaranteed money regardless of neighbor participation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h5 className="font-bold text-yellow-800 mb-2">Example Sponsored Tasks</h5>
              <div className="space-y-2 text-sm text-yellow-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Document meal prep routine - $55
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Show kids' learning activities - $45
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Complete home makeover - $120
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Budget & meal planning system - $85
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h5 className="font-bold text-green-800 mb-2">Why Brands Sponsor</h5>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Authentic parent content
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Real family insights
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Community building
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Support parent income
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsored Task Approval Process */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="text-blue-600 mr-2" size={24} />
            How Sponsored Tasks Get Approved
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 mt-1">1</div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Apply for Sponsored Task</h4>
                  <p className="text-blue-800 text-sm">
                    Choose a sponsored task that matches what you're already doing. Click "Apply" and tell us why you're perfect for it.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 mt-1">2</div>
                <div>
                  <h4 className="font-bold text-green-900 mb-2">Quick Review (24-48 hours)</h4>
                  <p className="text-green-800 text-sm">
                    Our team reviews your profile and ensures you're a good match. We check your rating, completed tasks, and expertise area.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-start">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 mt-1">3</div>
                <div>
                  <h4 className="font-bold text-purple-900 mb-2">Complete & Document</h4>
                  <p className="text-purple-800 text-sm">
                    Once approved, do your normal routine and document it! Take photos, videos, share tips, and follow the specific requirements.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-start">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 mt-1">4</div>
                <div>
                  <h4 className="font-bold text-orange-900 mb-2">Quality Review & Payment</h4>
                  <p className="text-orange-800 text-sm">
                    We review your submission for quality and completeness. Once approved (usually within 48 hours), your guaranteed payment is released!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center mb-2">
              <Shield className="text-green-600 mr-2" size={20} />
              <h4 className="font-bold text-gray-900">Payment Guarantee</h4>
            </div>
            <p className="text-gray-700 text-sm">
              Unlike shared tasks, sponsored tasks have <strong>guaranteed payments</strong>. Once you're approved and submit quality content meeting the requirements, 
              you <strong>will</strong> get paid - no neighbors needed, no cancellations possible!
            </p>
          </div>

          <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center mb-2">
              <Star className="text-yellow-600 mr-2" size={20} />
              <h4 className="font-bold text-gray-900">Approval Requirements</h4>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                4+ star rating on TaskParent
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                At least 3 completed tasks
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Relevant experience in the task category
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Clear photos/videos showing your work
              </div>
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
            
            <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-400">
              <p className="text-gray-700 text-sm mb-2">
                "Sponsored tasks are amazing! I earned $270 last week just documenting my normal routines - 
                meal prep system ($55), kids' activities ($45), and a complete home organization makeover ($120). No neighbors needed!"
              </p>
              <p className="text-yellow-700 font-medium text-sm">- Jessica R., Mom of 1</p>
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
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-bold text-green-800 mb-3">Weekly Shared Tasks</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>2 Meal prep sessions ($35 each)</span>
                  <span className="font-medium">$70</span>
                </div>
                <div className="flex justify-between">
                  <span>1 Costco run ($25)</span>
                  <span className="font-medium">$25</span>
                </div>
                <div className="flex justify-between">
                  <span>3 Childcare sessions ($35 each)</span>
                  <span className="font-medium">$105</span>
                </div>
                <div className="border-t border-green-300 pt-2 flex justify-between font-bold">
                  <span>Weekly Total:</span>
                  <span>$200</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-3">Weekly Sponsored Tasks</h4>
              <div className="space-y-2 text-sm text-yellow-700">
                <div className="flex justify-between">
                  <span>Meal prep documentation ($55)</span>
                  <span className="font-medium">$55</span>
                </div>
                <div className="flex justify-between">
                  <span>Kids' activities ($45)</span>
                  <span className="font-medium">$45</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget planning system ($85)</span>
                  <span className="font-medium">$85</span>
                </div>
                <div className="border-t border-yellow-300 pt-2 flex justify-between font-bold">
                  <span>Weekly Total:</span>
                  <span>$185</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-white text-center">
            <h4 className="font-bold text-xl mb-2">Combined Weekly Earning Potential</h4>
            <div className="text-3xl font-bold mb-2">$385/week</div>
            <div className="text-lg opacity-90">= $1,540/month = $20,020/year</div>
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