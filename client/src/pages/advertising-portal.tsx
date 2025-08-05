import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Megaphone, 
  Shield, 
  Heart, 
  Leaf, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  Star,
  Eye,
  Target
} from "lucide-react";

const advertisingApplicationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  adType: z.enum(['native_feed', 'banner', 'sponsored_task', 'affiliate_product']),
  proposedBudget: z.number().min(500, "Minimum monthly budget is $500"),
  targetAudience: z.string().min(5, "Please describe your target audience"),
  contentDescription: z.string().min(20, "Content description must be at least 20 characters"),
  proposedCommissionRate: z.number().min(0).max(20).optional(),
  ethicalCriteria: z.object({
    hrcScore: z.number().min(0).max(100),
    deiCommitment: z.boolean(),
    lgbtqSupport: z.boolean(),
    environmentalScore: z.number().min(0).max(100),
    childSafetyCompliance: z.boolean(),
    dataPrivacyScore: z.number().min(0).max(100),
    controversyScore: z.number().min(0).max(100),
    familyFriendlyContent: z.boolean(),
    transparentAdvertising: z.boolean()
  }),
  adContent: z.object({
    title: z.string().min(5, "Ad title must be at least 5 characters"),
    description: z.string().min(10, "Ad description must be at least 10 characters"),
    ctaText: z.string().min(3, "Call-to-action text required"),
    landingUrl: z.string().url("Valid URL required")
  }).optional()
});

type AdvertisingApplicationForm = z.infer<typeof advertisingApplicationSchema>;

export default function AdvertisingPortal() {
  const [activeTab, setActiveTab] = useState<'application' | 'approved' | 'evaluation'>('application');
  const [applicationResult, setApplicationResult] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<AdvertisingApplicationForm>({
    resolver: zodResolver(advertisingApplicationSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      adType: "native_feed",
      proposedBudget: 2000,
      targetAudience: "",
      contentDescription: "",
      proposedCommissionRate: 5,
      ethicalCriteria: {
        hrcScore: 50,
        deiCommitment: false,
        lgbtqSupport: false,
        environmentalScore: 50,
        childSafetyCompliance: false,
        dataPrivacyScore: 50,
        controversyScore: 50,
        familyFriendlyContent: false,
        transparentAdvertising: false
      },
      adContent: {
        title: "",
        description: "",
        ctaText: "",
        landingUrl: ""
      }
    }
  });

  const { data: approvedAds, isLoading: adsLoading } = useQuery({
    queryKey: ["/api/advertising/approved"],
  });

  const { data: demoEvaluation, isLoading: demoLoading } = useQuery({
    queryKey: ["/api/advertising/demo-evaluation"],
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: AdvertisingApplicationForm) => {
      return await apiRequest("POST", "/api/advertising/apply", data);
    },
    onSuccess: (result) => {
      setApplicationResult(result);
      toast({
        title: result.status === 'approved' ? "Advertising Approved!" : "Application Needs Improvement",
        description: result.message,
        variant: result.status === 'approved' ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Application Error",
        description: "Failed to submit advertising application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: AdvertisingApplicationForm) => {
    applicationMutation.mutate(data);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdTypeDisplay = (adType: string) => {
    return adType.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (adsLoading || demoLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Ethical Advertising Portal</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Advertise on BittieTasks through our ethical evaluation system. We ensure all advertising meets 
          strict standards for family safety, data privacy, and social responsibility.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="application">
            <Megaphone className="h-4 w-4 mr-2" />
            Submit Application
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved Advertisers
          </TabsTrigger>
          <TabsTrigger value="evaluation">
            <Star className="h-4 w-4 mr-2" />
            Evaluation Demo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="application" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advertising Application</CardTitle>
              <CardDescription>
                Apply to advertise on BittieTasks. All advertising is evaluated against our ethical criteria 
                including child safety, data privacy, family-friendly content, and social responsibility.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="health-wellness">Health & Wellness</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                              <SelectItem value="financial">Financial Services</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advertising Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="native_feed">Native Feed Ads</SelectItem>
                              <SelectItem value="banner">Banner Advertising</SelectItem>
                              <SelectItem value="sponsored_task">Sponsored Tasks</SelectItem>
                              <SelectItem value="affiliate_product">Affiliate Marketing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="proposedBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Budget ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={500}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Parents with young children, Active families" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contentDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your advertising content, products/services being promoted, and how it benefits families..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('adType') === 'affiliate_product' && (
                    <FormField
                      control={form.control}
                      name="proposedCommissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proposed Commission Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0}
                              max={20}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Commission rate for affiliate marketing (0-20%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ethical Criteria Assessment</h3>
                    <p className="text-sm text-gray-600">
                      BittieTasks requires strict ethical standards for all advertising. Please provide accurate information.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="ethicalCriteria.hrcScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                HRC Corporate Equality Index (0-100)
                              </FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Slider
                                    value={[field.value]}
                                    onValueChange={(values) => field.onChange(values[0])}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                  />
                                  <div className="text-center">
                                    <Badge variant={field.value >= 75 ? "default" : "secondary"}>
                                      {field.value}/100
                                    </Badge>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ethicalCriteria.dataPrivacyScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Data Privacy Score (0-100)
                              </FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Slider
                                    value={[field.value]}
                                    onValueChange={(values) => field.onChange(values[0])}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                  />
                                  <div className="text-center">
                                    <Badge variant={field.value >= 70 ? "default" : "secondary"}>
                                      {field.value}/100
                                    </Badge>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="ethicalCriteria.childSafetyCompliance"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-red-600 font-medium">
                                  Child Safety Compliance (Required)
                                </FormLabel>
                                <FormDescription>
                                  COPPA compliant and child-safe content
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ethicalCriteria.familyFriendlyContent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-red-600 font-medium">
                                  Family-Friendly Content (Required)
                                </FormLabel>
                                <FormDescription>
                                  Content appropriate for families and children
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ethicalCriteria.transparentAdvertising"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-red-600 font-medium">
                                  Transparent Advertising (Required)
                                </FormLabel>
                                <FormDescription>
                                  Clear disclosure of sponsored content
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ethicalCriteria.deiCommitment"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  DEI Commitment
                                </FormLabel>
                                <FormDescription>
                                  Documented diversity, equity & inclusion programs
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ethicalCriteria.lgbtqSupport"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  LGBTQ+ Support
                                </FormLabel>
                                <FormDescription>
                                  Supports LGBTQ+ rights and workplace equality
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ad Content Preview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adContent.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Your compelling ad title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adContent.ctaText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Call-to-Action Text</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Shop Now, Learn More" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="adContent.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of what you're advertising"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adContent.landingUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Landing Page URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourwebsite.com/landing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={applicationMutation.isPending}
                  >
                    {applicationMutation.isPending ? "Evaluating..." : "Submit Advertising Application"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {applicationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {applicationResult.status === 'approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  Application Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={applicationResult.status === 'approved' ? 'default' : 'destructive'}>
                    {applicationResult.status === 'approved' ? 'Approved' : 'Rejected'}
                  </Badge>
                  {applicationResult.tier && (
                    <Badge className={getTierColor(applicationResult.tier)}>
                      {applicationResult.tier.charAt(0).toUpperCase() + applicationResult.tier.slice(1)} Tier
                    </Badge>
                  )}
                </div>
                
                <p>{applicationResult.message}</p>
                
                {applicationResult.revenueSplit && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">Revenue Split (Monthly):</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Platform Fee:</span>
                        <p className="text-green-600">${applicationResult.revenueSplit.platformFee.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">User Earnings:</span>
                        <p className="text-green-600">${applicationResult.revenueSplit.userEarnings.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Creator Bonus:</span>
                        <p className="text-green-600">${applicationResult.revenueSplit.creatorBonus.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Next Steps:</h4>
                  <p className="text-sm">{applicationResult.nextSteps}</p>
                </div>
                
                {applicationResult.evaluation && (
                  <div>
                    <h4 className="font-medium mb-2">Ethical Score: {applicationResult.evaluation.score}/100</h4>
                    <Progress value={applicationResult.evaluation.score} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedAds?.map((advertiser: any, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {advertiser.companyName}
                    <Badge className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </CardTitle>
                  <CardDescription>{advertiser.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Ad Type:</span>
                      <span className="text-sm">{getAdTypeDisplay(advertiser.adType)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Budget:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${advertiser.proposedBudget.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{advertiser.contentDescription}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Target:</span>
                      <span className="text-sm">{advertiser.targetAudience}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          {demoEvaluation && (
            <Card>
              <CardHeader>
                <CardTitle>Example Advertising Evaluation</CardTitle>
                <CardDescription>
                  See how our ethical evaluation system assesses potential advertisers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Advertiser Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Company:</span> {demoEvaluation.candidate.companyName}</div>
                      <div><span className="font-medium">Industry:</span> {demoEvaluation.candidate.industry}</div>
                      <div><span className="font-medium">Ad Type:</span> {getAdTypeDisplay(demoEvaluation.candidate.adType)}</div>
                      <div><span className="font-medium">Budget:</span> ${demoEvaluation.candidate.proposedBudget.toLocaleString()}/month</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Evaluation Results</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ethical Score:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">
                            {demoEvaluation.evaluation.score}/100
                          </span>
                          <Badge className={getTierColor(demoEvaluation.evaluation.tier)}>
                            {demoEvaluation.evaluation.tier.charAt(0).toUpperCase() + demoEvaluation.evaluation.tier.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={demoEvaluation.evaluation.score} className="h-2" />
                      <p className="text-sm text-gray-600">{demoEvaluation.evaluation.recommendation}</p>
                    </div>
                  </div>
                </div>

                {demoEvaluation.revenueSplit && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-3">Revenue Distribution (Monthly)</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">Platform Fee</div>
                        <div className="text-xl font-bold text-blue-600">
                          ${demoEvaluation.revenueSplit.platformFee.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">User Earnings</div>
                        <div className="text-xl font-bold text-green-600">
                          ${demoEvaluation.revenueSplit.userEarnings.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Creator Bonus</div>
                        <div className="text-xl font-bold text-purple-600">
                          ${demoEvaluation.revenueSplit.creatorBonus.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-green-600">Strengths</h4>
                    <ul className="space-y-1 text-sm">
                      {demoEvaluation.evaluation.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {demoEvaluation.evaluation.concerns.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-orange-600">Areas for Improvement</h4>
                      <ul className="space-y-1 text-sm">
                        {demoEvaluation.evaluation.concerns.map((concern: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}