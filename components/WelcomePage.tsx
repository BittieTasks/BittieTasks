'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

// Interactive Earnings Calculator Component
function EarningsCalculator() {
  const [tasksPerWeek, setTasksPerWeek] = useState(3)
  const [avgTaskValue, setAvgTaskValue] = useState(35)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const weeklyEarnings = tasksPerWeek * avgTaskValue
  const monthlyEarnings = weeklyEarnings * 4.33
  const yearlyEarnings = monthlyEarnings * 12

  if (!mounted) {
    return (
      <Card className="card-clean">
        <CardHeader>
          <CardTitle className="text-heading">Calculate Your Earnings</CardTitle>
          <CardDescription>Estimate your potential income from community tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tasks per week: 3
                </label>
                <div className="w-full h-2 bg-muted rounded"></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Average task value: $35
                </label>
                <div className="w-full h-2 bg-muted rounded"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1">$105</div>
                <p className="text-muted-foreground text-sm">Per Week</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1">$455</div>
                <p className="text-muted-foreground text-sm">Per Month</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold mb-1">$5,460</div>
                <p className="text-muted-foreground text-sm">Per Year</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-clean">
      <CardHeader>
        <CardTitle className="text-heading">Calculate Your Earnings</CardTitle>
        <CardDescription>Estimate your potential income from community tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tasks per week: {tasksPerWeek}
              </label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={tasksPerWeek}
                onChange={(e) => setTasksPerWeek(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Average task value: ${avgTaskValue}
              </label>
              <input 
                type="range" 
                min="15" 
                max="75" 
                step="5"
                value={avgTaskValue}
                onChange={(e) => setAvgTaskValue(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold mb-1">${Math.round(weeklyEarnings)}</div>
              <p className="text-muted-foreground text-sm">Per Week</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold mb-1">${Math.round(monthlyEarnings)}</div>
              <p className="text-muted-foreground text-sm">Per Month</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold mb-1">${Math.round(yearlyEarnings).toLocaleString()}</div>
              <p className="text-muted-foreground text-sm">Per Year</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container-clean py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">B</span>
              </div>
              <span className="text-xl font-semibold">BittieTasks</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="button-outline">Log In</Button>
              <Button className="button-clean">Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-clean relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-clean relative">
          <div className="text-center max-w-4xl mx-auto fade-in">
            <h1 className="text-display mb-6 text-gradient">
              Turn Daily Tasks Into Income
            </h1>
            <p className="text-subheading text-muted-foreground mb-8 max-w-2xl mx-auto slide-up">
              Join thousands of parents earning money by sharing everyday tasks with neighbors. 
              Create community connections while building financial independence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="button-clean">
                Start Earning Today
              </Button>
              <Button size="lg" variant="outline" className="button-outline">
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="section-clean bg-muted/50">
        <div className="container-clean">
          <div className="text-center mb-12">
            <h2 className="text-heading mb-4">See Your Earning Potential</h2>
            <p className="text-body text-muted-foreground">
              Calculate how much you could earn by sharing tasks in your community
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <EarningsCalculator />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-clean">
        <div className="container-clean">
          <div className="text-center mb-12">
            <h2 className="text-heading mb-4">Why Choose BittieTasks</h2>
            <p className="text-body text-muted-foreground">
              The trusted platform for community-based earning opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-subheading">Flexible Earning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-muted-foreground">
                  Work on your schedule. Choose tasks that fit your lifestyle and earn money 
                  from activities you're already doing.
                </p>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-subheading">Safe Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-muted-foreground">
                  All members are verified. Build trusted relationships with neighbors 
                  while creating income opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-subheading">Instant Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-muted-foreground">
                  Get paid immediately when tasks are completed. Secure payment processing 
                  with low platform fees.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Task Examples */}
      <section className="section-clean bg-muted/50">
        <div className="container-clean">
          <div className="text-center mb-12">
            <h2 className="text-heading mb-4">Popular Task Categories</h2>
            <p className="text-body text-muted-foreground">
              Real earning opportunities in your community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-clean">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-3">🛒</div>
                <h3 className="font-semibold mb-2">Group Shopping</h3>
                <p className="text-sm text-muted-foreground">$25-45 per trip</p>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-3">🚗</div>
                <h3 className="font-semibold mb-2">School Pickup</h3>
                <p className="text-sm text-muted-foreground">$15-30 per day</p>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-3">🎂</div>
                <h3 className="font-semibold mb-2">Event Planning</h3>
                <p className="text-sm text-muted-foreground">$40-85 per event</p>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-3">👥</div>
                <h3 className="font-semibold mb-2">Group Activities</h3>
                <p className="text-sm text-muted-foreground">$20-50 per session</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-clean">
        <div className="container-clean">
          <Card className="card-clean">
            <CardContent className="p-12 text-center">
              <h2 className="text-heading mb-4">Ready to Start Earning?</h2>
              <p className="text-body text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of parents who've transformed their daily routines into income streams. 
                Sign up today and start your first task this week.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="button-clean">
                  Create Account
                </Button>
                <Button size="lg" variant="outline" className="button-outline">
                  Browse Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container-clean py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">B</span>
                </div>
                <span className="font-semibold">BittieTasks</span>
              </div>
              <p className="text-small text-muted-foreground">
                Transforming daily tasks into income opportunities for parents everywhere.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-small text-muted-foreground">
                <li>How It Works</li>
                <li>Task Categories</li>
                <li>Pricing</li>
                <li>Safety</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-small text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-small text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
                <li>Guidelines</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-small text-muted-foreground">
              © 2025 BittieTasks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}