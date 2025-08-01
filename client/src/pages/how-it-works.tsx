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
                Turn your daily tasks into $50-200 extra income per week
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
                  Document meal prep routine - $35
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Show kids' learning activities - $25
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Organization transformation - $40
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Share parenting hacks - $20
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
                "I was already meal prepping every Sunday. Now 4 neighbors join me and I earn $100 every week 
                just doing what I was already doing for my family!"
              </p>
              <p className="text-yellow-700 font-medium text-sm">- Sarah M., Mom of 2</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
              <p className="text-gray-700 text-sm mb-2">
                "My Costco runs used to be a chore. Now I take orders from 6 families and make $90 
                every trip. It's like getting paid to do my own shopping!"
              </p>
              <p className="text-blue-700 font-medium text-sm">- Maria L., Mom of 3</p>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-400">
              <p className="text-gray-700 text-sm mb-2">
                "Sponsored tasks are amazing! I earned $140 last week just documenting my normal routines - 
                meal prep, kids' activities, and organizing my pantry. No neighbors needed!"
              </p>
              <p className="text-yellow-700 font-medium text-sm">- Jessica R., Mom of 1</p>
            </div>
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