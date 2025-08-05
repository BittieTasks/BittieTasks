import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Shield, 
  Target, 
  Eye, 
  MapPin, 
  DollarSign,
  Heart,
  Users,
  Zap,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const adPreferencesSchema = z.object({
  adFrequency: z.number().min(1).max(10),
  adRelevance: z.number().min(1).max(10),
  adTypes: z.array(z.string()).min(1, "Select at least one ad type"),
  adCategories: z.array(z.string()).min(1, "Select at least one category"),
  maxAdBudget: z.number().min(10).max(1000),
  minAdBudget: z.number().min(1).max(500),
  familyFriendlyOnly: z.boolean(),
  localAdsOnly: z.boolean(),
  ethicalAdsOnly: z.boolean(),
  adPersonalization: z.boolean()
});

type AdPreferencesForm = z.infer<typeof adPreferencesSchema>;

const AD_TYPES = [
  { id: 'native_feed', label: 'Native Feed Ads', description: 'Ads that blend naturally with task feeds' },
  { id: 'banner', label: 'Banner Ads', description: 'Traditional banner advertising' },
  { id: 'sponsored_task', label: 'Sponsored Tasks', description: 'Tasks sponsored by companies' },
  { id: 'affiliate_product', label: 'Product Recommendations', description: 'Affiliate marketing for family products' }
];

const AD_CATEGORIES = [
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'health-wellness', label: 'Health & Wellness', icon: '🏃‍♀️' },
  { id: 'retail', label: 'Family Shopping', icon: '🛍️' },
  { id: 'technology', label: 'Family Tech', icon: '📱' },
  { id: 'food-beverage', label: 'Food & Drinks', icon: '🥗' },
  { id: 'entertainment', label: 'Family Entertainment', icon: '🎭' },
  { id: 'financial', label: 'Family Finance', icon: '💰' },
  { id: 'automotive', label: 'Family Transportation', icon: '🚗' }
];

export default function AdPreferences() {
  const [activeTab, setActiveTab] = useState<'preferences' | 'preview' | 'insights'>('preferences');
  const [previewAds, setPreviewAds] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user/current"],
  });

  const { data: adInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/advertising/user-insights"],
  });

  const form = useForm<AdPreferencesForm>({
    resolver: zodResolver(adPreferencesSchema),
    defaultValues: {
      adFrequency: 5,
      adRelevance: 7,
      adTypes: ['native_feed', 'sponsored_task'],
      adCategories: ['education', 'health-wellness', 'retail'],
      maxAdBudget: 100,
      minAdBudget: 10,
      familyFriendlyOnly: true,
      localAdsOnly: false,
      ethicalAdsOnly: true,
      adPersonalization: true
    }
  });

  // Load user's current ad preferences
  useEffect(() => {
    if (currentUser) {
      form.reset({
        adFrequency: currentUser.adFrequency || 5,
        adRelevance: currentUser.adRelevance || 7,
        adTypes: currentUser.adTypes || ['native_feed', 'sponsored_task'],
        adCategories: currentUser.adCategories || ['education', 'health-wellness', 'retail'],
        maxAdBudget: currentUser.maxAdBudget || 100,
        minAdBudget: currentUser.minAdBudget || 10,
        familyFriendlyOnly: currentUser.familyFriendlyOnly !== false,
        localAdsOnly: currentUser.localAdsOnly || false,
        ethicalAdsOnly: currentUser.ethicalAdsOnly !== false,
        adPersonalization: currentUser.adPersonalization !== false
      });
    }
  }, [currentUser, form]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: AdPreferencesForm) => {
      return await apiRequest("PUT", "/api/user/ad-preferences", preferences);
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your advertising preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      loadPreviewAds();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update your preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  const loadPreviewAds = async () => {
    try {
      const preferences = form.getValues();
      const response = await apiRequest("POST", "/api/advertising/preview", preferences);
      setPreviewAds(response.slice(0, 3)); // Show top 3 preview ads
    } catch (error) {
      console.error('Failed to load preview ads:', error);
    }
  };

  const onSubmit = (data: AdPreferencesForm) => {
    updatePreferencesMutation.mutate(data);
  };

  const watchedValues = form.watch();

  // Auto-update preview when preferences change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadPreviewAds();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchedValues]);

  const getFrequencyLabel = (value: number) => {
    if (value <= 2) return "Minimal";
    if (value <= 4) return "Light";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "Regular";
    return "Frequent";
  };

  const getRelevanceLabel = (value: number) => {
    if (value <= 3) return "General";
    if (value <= 6) return "Somewhat Targeted";
    if (value <= 8) return "Well Targeted";
    return "Highly Personalized";
  };

  if (userLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
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
        <h1 className="text-3xl font-bold">Ad Preferences</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Customize your advertising experience. Control what types of ads you see, how often, 
          and how they're targeted to your interests while maintaining our strict ethical standards.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Target className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advertising Controls
              </CardTitle>
              <CardDescription>
                Fine-tune your advertising experience with these controls. All ads meet our strict ethical standards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Frequency Control */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Ad Frequency</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="adFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>How often would you like to see ads?</FormLabel>
                            <Badge variant="outline">
                              {getFrequencyLabel(field.value)} ({field.value}/10)
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                                max={10}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Minimal</span>
                                <span>Moderate</span>
                                <span>Frequent</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Lower values mean fewer ads, higher values mean more advertising opportunities.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Targeting Control */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Ad Relevance</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="adRelevance"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>How targeted should ads be to your interests?</FormLabel>
                            <Badge variant="outline">
                              {getRelevanceLabel(field.value)} ({field.value}/10)
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                                max={10}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>General</span>
                                <span>Targeted</span>
                                <span>Highly Personal</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Higher values use more of your activity data to show relevant ads.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Ad Types */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold">Ad Types</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="adTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Which types of advertising would you like to see?</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {AD_TYPES.map((type) => (
                              <div key={type.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                <Checkbox
                                  checked={field.value.includes(type.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, type.id]);
                                    } else {
                                      field.onChange(field.value.filter(id => id !== type.id));
                                    }
                                  }}
                                />
                                <div className="space-y-1 leading-none">
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-sm text-gray-600">{type.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Categories */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold">Interest Categories</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="adCategories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Which categories interest you?</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {AD_CATEGORIES.map((category) => (
                              <div key={category.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                                <Checkbox
                                  checked={field.value.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, category.id]);
                                    } else {
                                      field.onChange(field.value.filter(id => id !== category.id));
                                    }
                                  }}
                                />
                                <div className="flex items-center gap-2 text-sm">
                                  <span>{category.icon}</span>
                                  <span>{category.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Budget Range */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Advertiser Budget Range</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minAdBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Budget</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(values) => field.onChange(values[0])}
                                  max={500}
                                  min={1}
                                  step={5}
                                  className="w-full"
                                />
                                <div className="text-center">
                                  <Badge>${field.value}/month</Badge>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Only show ads from companies with at least this monthly budget
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxAdBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Budget</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(values) => field.onChange(values[0])}
                                  max={1000}
                                  min={10}
                                  step={10}
                                  className="w-full"
                                />
                                <div className="text-center">
                                  <Badge>${field.value}/month</Badge>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Show ads up to this budget level (higher budgets often mean premium companies)
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Safety & Ethics Controls */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold">Safety & Ethics</h3>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="familyFriendlyOnly"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <FormLabel className="font-medium">Family-Friendly Content Only</FormLabel>
                              <FormDescription>
                                Only show ads with content appropriate for families and children
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ethicalAdsOnly"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <FormLabel className="font-medium">Ethical Companies Only</FormLabel>
                              <FormDescription>
                                Only show ads from companies that meet our ethical standards (HRC, DEI, LGBTQ+ support)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="localAdsOnly"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <FormLabel className="font-medium">Local Businesses Priority</FormLabel>
                              <FormDescription>
                                Prefer ads from businesses in your local area
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adPersonalization"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <FormLabel className="font-medium">Ad Personalization</FormLabel>
                              <FormDescription>
                                Use your activity data to show more relevant ads
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={updatePreferencesMutation.isPending}
                  >
                    {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Ad Preview
              </CardTitle>
              <CardDescription>
                See how your preferences affect the ads you'll see. This preview updates automatically as you change settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewAds.length > 0 ? (
                <div className="space-y-4">
                  {previewAds.map((ad, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{ad.adContent?.title || ad.companyName}</h4>
                        <Badge variant="outline">{ad.adType.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{ad.adContent?.description || ad.contentDescription}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{ad.industry}</span>
                        <span>${ad.proposedBudget}/month budget</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No matching ads found with your current preferences.</p>
                  <p className="text-sm">Try adjusting your settings to see more options.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Ad Insights
              </CardTitle>
              <CardDescription>
                Understanding how advertising affects your earnings and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="font-bold text-2xl text-blue-600">
                    ${adInsights?.estimatedMonthlyEarnings || "15-45"}
                  </div>
                  <div className="text-sm text-blue-800">Estimated Monthly Ad Earnings</div>
                  <div className="text-xs text-blue-600 mt-1">Based on your current preferences</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="font-bold text-2xl text-green-600">
                    {adInsights?.relevanceScore || "87"}%
                  </div>
                  <div className="text-sm text-green-800">Relevance Score</div>
                  <div className="text-xs text-green-600 mt-1">How well ads match your interests</div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="font-bold text-2xl text-purple-600">
                    {adInsights?.ethicalComplianceRate || "100"}%
                  </div>
                  <div className="text-sm text-purple-800">Ethical Compliance</div>
                  <div className="text-xs text-purple-600 mt-1">Ads meeting ethical standards</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Privacy & Control</h4>
                    <p className="text-sm text-yellow-700">
                      You maintain full control over your advertising experience. All data used for personalization 
                      stays secure and is only used to show you relevant, family-safe content from ethical companies.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}