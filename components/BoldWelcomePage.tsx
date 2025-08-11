'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, DollarSign, Users, Clock, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AuthModal from '@/components/auth/AuthModal'

export default function BoldWelcomePage() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const handleGetStarted = () => {
    setAuthMode('signup')
    setShowAuth(true)
  }

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuth(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  BittieTasks
                </span>
              </motion.div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleSignIn}
                className="text-emerald-700 hover:text-emerald-800"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge className="bg-emerald-100 text-emerald-800 px-4 py-2 text-sm font-medium">
                🎉 Now Live - Start Earning Today!
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Turn Daily Tasks Into
                <br />
                <span className="text-emerald-600">Real Money</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join thousands of parents earning $500-2000+ monthly by sharing everyday activities with neighbors. 
                From playground visits to grocery runs - every task pays.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Start Earning Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleSignIn}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg"
                >
                  Sign In to Platform
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Parents', value: '12,000+', icon: Users },
              { label: 'Tasks Completed', value: '50,000+', icon: CheckCircle },
              { label: 'Total Earnings', value: '$2.4M+', icon: DollarSign },
              { label: 'Avg Monthly Income', value: '$847', icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Parents Are Making Money
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real earning opportunities from everyday activities you're already doing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Playground Visits',
                description: 'Host playground meetups and earn $25-45 per session',
                earnings: '$25-45',
                time: '2 hours',
                participants: '3-5 kids',
                gradient: 'from-emerald-400 to-green-500'
              },
              {
                title: 'Grocery Shopping',
                description: 'Shop for neighbors and earn while you shop for yourself',
                earnings: '$15-30',
                time: '1 hour',
                participants: '2-3 families',
                gradient: 'from-blue-400 to-purple-500'
              },
              {
                title: 'School Pickup',
                description: 'Coordinate carpools and earn from shared transportation',
                earnings: '$20-35',
                time: '30 mins',
                participants: '4-6 kids',
                gradient: 'from-purple-400 to-pink-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}>
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-gray-600">Earnings</span>
                      <span className="font-bold text-emerald-600">{feature.earnings}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">Time</span>
                      <span className="font-bold text-blue-600">{feature.time}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Participants</span>
                      <span className="font-bold text-purple-600">{feature.participants}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Earning Plan
            </h2>
            <p className="text-xl text-gray-600">
              Lower fees mean higher earnings for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free',
                price: '$0',
                fee: '10%',
                description: 'Perfect for getting started',
                features: ['Basic task access', 'Community support', 'Mobile app', 'Payment processing'],
                popular: false
              },
              {
                name: 'Pro',
                price: '$9.99',
                fee: '7%',
                description: 'Most popular for regular earners',
                features: ['Priority task notifications', 'Advanced analytics', 'Higher-paying tasks', 'Direct messaging'],
                popular: true
              },
              {
                name: 'Premium',
                price: '$19.99',
                fee: '5%',
                description: 'Maximum earnings for power users',
                features: ['Exclusive high-value tasks', 'Personal success coach', 'Custom scheduling', 'VIP support'],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? 'ring-2 ring-emerald-500 shadow-xl' : ''} bg-white/90 backdrop-blur-sm`}>
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {plan.price}<span className="text-lg text-gray-600">/month</span>
                      </div>
                      <div className="text-lg font-semibold text-emerald-600">
                        {plan.fee} platform fee
                      </div>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white' 
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Turn Your Daily Tasks Into Income?
            </h2>
            <p className="text-xl text-emerald-100">
              Join thousands of parents already earning money from activities they're already doing
            </p>
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              Start Earning Today <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">BittieTasks</span>
            </div>
            <p className="text-gray-400">
              Transforming everyday tasks into meaningful income for parents everywhere
            </p>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        mode={authMode}
      />
    </div>
  )
}