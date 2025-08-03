import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessibleButton } from "@/components/ui/accessible-button";
import { Heart, Users, DollarSign, Shield, CheckCircle, Star } from "lucide-react";
import { ARIA_LABELS } from "@/lib/accessibility";

export default function AccessibleLanding() {
  const handleDemoLogin = async () => {
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Demo login failed:", error);
    }
  };

  const features = [
    {
      icon: Heart,
      title: "Parent Wellness First",
      description: "Track self-care activities, earn wellness badges, and prioritize your mental health while building community connections.",
      ariaLabel: "Learn about parent wellness features"
    },
    {
      icon: Users,
      title: "Authentic Community",
      description: "Connect with verified parents in your neighborhood. Share household tasks and build lasting friendships.",
      ariaLabel: "Learn about community building"
    },
    {
      icon: DollarSign,
      title: "Earn $75+ Weekly",
      description: "Generate supplemental income by coordinating meal prep, grocery runs, and organizing sessions with neighbors.",
      ariaLabel: "Learn about earning opportunities"
    },
    {
      icon: Shield,
      title: "Safety & Trust",
      description: "Background-verified parents, platform insurance, and AI-powered safety monitoring ensure secure interactions.",
      ariaLabel: "Learn about safety features"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      location: "Denver, CO",
      text: "TaskParent helped me earn $320 monthly while building amazing friendships with neighbor families. The wellness tracking keeps me focused on self-care too!",
      rating: 5
    },
    {
      name: "Maria L.",
      location: "Austin, TX", 
      text: "I love coordinating meal prep circles. It saves time, builds community, and the extra income really helps our family budget.",
      rating: 5
    },
    {
      name: "Jennifer K.",
      location: "Charlotte, NC",
      text: "The AI approval system makes everything so smooth. I get paid instantly for my wellness activities and can focus on what matters most.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header 
        className="bg-white shadow-sm border-b"
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-gray-900">TaskParent</h1>
            </div>
            
            <nav role="navigation" aria-label="Main navigation">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/how-it-works"
                  className="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md"
                  aria-label="Learn how TaskParent works"
                >
                  How It Works
                </Link>
                <AccessibleButton
                  onClick={handleDemoLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  ariaLabel="Try TaskParent demo - explore the platform"
                >
                  Try Demo
                </AccessibleButton>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="max-w-6xl mx-auto px-4 py-16 text-center"
        aria-labelledby="hero-heading"
      >
        <h2 id="hero-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Transform Your Parent Community
          <span className="block text-blue-600 mt-2">Through Wellness & Earning</span>
        </h2>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          Join 35,000+ parents earning $200-600 monthly by sharing household tasks with neighbors, 
          while tracking wellness activities and building authentic community connections.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <AccessibleButton
            onClick={handleDemoLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg min-w-[200px]"
            ariaLabel="Start your TaskParent journey with our interactive demo"
          >
            Start Your Journey
          </AccessibleButton>
          
          <Link href="/how-it-works">
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg min-w-[200px]"
              aria-label="Learn more about how TaskParent works"
            >
              Learn More
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 flex justify-center items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            <span>Background Verified</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" aria-hidden="true" />
            <span>Platform Insured</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-green-600" aria-hidden="true" />
            <span>Wellness Focused</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="max-w-6xl mx-auto px-4 py-16"
        aria-labelledby="features-heading"
      >
        <h2 id="features-heading" className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Parents Choose TaskParent
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <feature.icon 
                    className="h-8 w-8 text-blue-600" 
                    aria-hidden="true"
                  />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        className="bg-white py-16"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 id="testimonials-heading" className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Parents Are Saying
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-5 w-5 text-yellow-400 fill-current" 
                        aria-hidden="true"
                      />
                    ))}
                    <span className="sr-only">{testimonial.rating} out of 5 stars</span>
                  </div>
                  
                  <blockquote className="text-gray-600 mb-4 italic">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <footer>
                    <cite className="font-semibold text-gray-900">
                      {testimonial.name}
                    </cite>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </footer>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="bg-blue-600 py-16"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 id="cta-heading" className="text-3xl font-bold text-white mb-6">
            Ready to Build Your Parent Community?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of parents who are earning income, building friendships, 
            and prioritizing their wellness through TaskParent.
          </p>
          
          <AccessibleButton
            onClick={handleDemoLogin}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            ariaLabel="Get started with TaskParent today"
          >
            Get Started Today
          </AccessibleButton>
          
          <p className="text-blue-200 text-sm mt-4">
            No credit card required • Start earning in 24 hours
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="bg-gray-900 text-white py-12"
        role="contentinfo"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="h-6 w-6 text-blue-400" aria-hidden="true" />
                <span className="text-lg font-semibold">TaskParent</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering parent communities through wellness, connection, and economic opportunity.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Safety & Trust</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Parent Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wellness Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 TaskParent. All rights reserved. Building stronger parent communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}