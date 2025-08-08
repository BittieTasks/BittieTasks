import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, DollarSign, Users, TrendingUp, Star, Building, Mail, Globe, PiggyBank } from "lucide-react";

export default function PartnersPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    contactName: '',
    website: '',
    monthlyBudget: '',
    industry: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationResult, setApplicationResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sponsorship/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthlyBudget: parseFloat(formData.monthlyBudget)
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setApplicationResult(result);
        toast({
          title: "Application Approved!",
          description: `Welcome to BittieTasks ${result.approvalTier} tier!`,
        });
      } else {
        toast({
          title: "Application Error",
          description: result.error || "Failed to submit application",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (applicationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                🎉 Partnership Approved!
              </CardTitle>
              <CardDescription className="text-lg text-green-700 dark:text-green-300">
                {applicationResult.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Your Partnership Details:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Application ID:</span>
                      <Badge variant="secondary">{applicationResult.applicationId}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier:</span>
                      <Badge variant="default" className="capitalize">{applicationResult.approvalTier}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="default" className="bg-green-600">{applicationResult.status}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Pricing Structure:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Participant Payment:</span>
                      <span className="font-medium">{applicationResult.pricing.participantPayment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee:</span>
                      <span className="font-medium">{applicationResult.pricing.platformFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Participants:</span>
                      <span className="font-medium">{applicationResult.pricing.maxParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Reach:</span>
                      <span className="font-medium">{applicationResult.pricing.estimatedReach}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Next Steps:</h3>
                <p className="text-blue-700 dark:text-blue-300 mb-3">{applicationResult.nextSteps}</p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => window.location.href = 'mailto:partnerships@bittietasks.com?subject=New Partnership - ' + formData.companyName}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Partnership Team
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Submit Another Application
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Partner with BittieTasks
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Connect with 1000+ engaged families through authentic community tasks. 
            Drive brand awareness while supporting parents earning meaningful income.
          </p>
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">1000+ Families</h3>
              <p className="text-gray-600 dark:text-gray-400">Active community members</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">85% Completion</h3>
              <p className="text-gray-600 dark:text-gray-400">Task success rate</p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">4.8/5 Rating</h3>
              <p className="text-gray-600 dark:text-gray-400">Average satisfaction</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">$150K+ Earned</h3>
              <p className="text-gray-600 dark:text-gray-400">By community members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Partnership Tiers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">Basic</CardTitle>
                <CardDescription>Perfect for small businesses</CardDescription>
                <div className="text-2xl font-bold text-purple-600">$1,000 - $1,999/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Community engagement tasks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Email support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>$22-30 participant payments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">Standard</CardTitle>
                <CardDescription>Most popular choice</CardDescription>
                <div className="text-2xl font-bold text-blue-600">$2,000 - $4,999/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Priority task placement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>$25-35 participant payments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gold-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardHeader>
                <Badge className="w-fit bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-2">
                  PREMIUM
                </Badge>
                <CardTitle className="text-xl">Premium</CardTitle>
                <CardDescription>Enterprise-level partnership</CardDescription>
                <div className="text-2xl font-bold text-orange-600">$5,000+/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Featured brand placement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Custom task types</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>White-glove service</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>$30-50 participant payments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building className="w-6 h-6" />
                Apply for Partnership
              </CardTitle>
              <CardDescription>
                Start generating revenue through authentic family engagement. Most applications are approved within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Your Company Inc."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="partnerships@yourcompany.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website *</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourcompany.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="monthlyBudget">Monthly Budget (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="monthlyBudget"
                        type="number"
                        value={formData.monthlyBudget}
                        onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                        placeholder="5000"
                        className="pl-10"
                        min="1000"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Minimum $1,000/month</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail & E-commerce</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="education">Education & Learning</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Financial Services</SelectItem>
                        <SelectItem value="travel">Travel & Hospitality</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Tell us about your goals</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="What do you hope to achieve with BittieTasks partnerships? What types of tasks or community engagement are you interested in?"
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isSubmitting ? "Submitting Application..." : "Apply for Partnership"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Partner Success Stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">EcoClean Products</CardTitle>
                <CardDescription>Household cleaning supplies</CardDescription>
              </CardHeader>
              <CardContent>
                <blockquote className="text-gray-600 dark:text-gray-300 italic mb-4">
                  "BittieTasks helped us reach 200+ families with our eco-friendly cleaning challenge. 
                  Participants loved earning money while trying our products!"
                </blockquote>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">ROI: 340%</span>
                  <span className="text-green-600">★★★★★</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Tree Tutoring</CardTitle>
                <CardDescription>Educational services</CardDescription>
              </CardHeader>
              <CardContent>
                <blockquote className="text-gray-600 dark:text-gray-300 italic mb-4">
                  "We created reading challenges for families and saw amazing engagement. 
                  Many participants became long-term customers."
                </blockquote>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">New customers: 45</span>
                  <span className="text-green-600">★★★★★</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Healthy Habits Nutrition</CardTitle>
                <CardDescription>Meal planning service</CardDescription>
              </CardHeader>
              <CardContent>
                <blockquote className="text-gray-600 dark:text-gray-300 italic mb-4">
                  "Our family meal prep challenges generated incredible authentic content 
                  and strong brand loyalty from participants."
                </blockquote>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Conversion: 25%</span>
                  <span className="text-green-600">★★★★★</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}