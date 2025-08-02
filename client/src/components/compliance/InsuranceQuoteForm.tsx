import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Shield, DollarSign, Phone, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const insuranceQuoteSchema = z.object({
  annualRevenue: z.number().min(0, "Revenue must be positive"),
  numberOfEmployees: z.number().min(0, "Number of employees must be positive"),
  numberOfUsers: z.number().min(0, "Number of users must be positive"),
  operatingStates: z.array(z.string()).min(1, "At least one state is required"),
  hasChildcareServices: z.boolean(),
  dataStorageAmount: z.enum(['minimal', 'moderate', 'extensive']),
});

type InsuranceQuoteForm = z.infer<typeof insuranceQuoteSchema>;

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function InsuranceQuoteForm() {
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const { toast } = useToast();

  // Fetch insurance requirements
  const { data: insuranceRequirements, isLoading } = useQuery({
    queryKey: ["/api/legal/insurance-requirements"],
  });

  const form = useForm<InsuranceQuoteForm>({
    resolver: zodResolver(insuranceQuoteSchema),
    defaultValues: {
      annualRevenue: 5000000,
      numberOfEmployees: 25,
      numberOfUsers: 75000,
      operatingStates: ['CA', 'NY', 'TX', 'FL'],
      hasChildcareServices: true,
      dataStorageAmount: 'extensive',
    },
  });

  const getQuoteMutation = useMutation({
    mutationFn: async (data: InsuranceQuoteForm) => {
      return await apiRequest("/api/legal/insurance-quote", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data) => {
      setQuoteResult(data);
      toast({
        title: "Insurance Quote Generated",
        description: "Your insurance quote has been calculated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Quote Generation Failed",
        description: error.message || "Failed to generate insurance quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsuranceQuoteForm) => {
    getQuoteMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p>Loading insurance requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sample Quote Display */}
      {insuranceRequirements?.sampleQuote && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              TaskParent Sample Insurance Quote
            </CardTitle>
            <CardDescription>
              Estimated insurance costs for TaskParent platform operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Annual Insurance Cost</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {formatCurrency(insuranceRequirements.sampleQuote.totalAnnualCost.minimum)} - {formatCurrency(insuranceRequirements.sampleQuote.totalAnnualCost.maximum)}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Risk Factors:</h4>
                  <ul className="space-y-1">
                    {insuranceRequirements.sampleQuote.riskFactors.map((factor: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Required Coverage:</h4>
                <div className="space-y-2">
                  {insuranceRequirements.sampleQuote.coverages.map((coverage: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{coverage.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{coverage.coverage}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(coverage.premium.min)} - {formatCurrency(coverage.premium.max)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{coverage.premium.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <h4 className="font-medium">Recommendations:</h4>
              <ul className="space-y-1">
                {insuranceRequirements.sampleQuote.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Quote Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Custom Insurance Quote Calculator
          </CardTitle>
          <CardDescription>
            Get a personalized insurance quote based on your specific business parameters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="annualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projected Annual Revenue</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5000000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Expected gross revenue in USD
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="25"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Full-time and part-time employees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Number of Users</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="75000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Total platform users (providers + requesters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataStorageAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Storage Amount</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data storage level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal (Basic user data only)</SelectItem>
                          <SelectItem value="moderate">Moderate (User data + activity logs)</SelectItem>
                          <SelectItem value="extensive">Extensive (Full data analytics + history)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="operatingStates"
                render={() => (
                  <FormItem>
                    <FormLabel>Operating States</FormLabel>
                    <FormDescription>
                      Select all states where you plan to operate
                    </FormDescription>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                      {US_STATES.map((state) => (
                        <FormField
                          key={state}
                          control={form.control}
                          name="operatingStates"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(state)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, state])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== state
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {state}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasChildcareServices"
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
                        Platform includes childcare services
                      </FormLabel>
                      <FormDescription>
                        Check if your platform facilitates any childcare or child supervision services
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={getQuoteMutation.isPending}
                className="w-full"
              >
                {getQuoteMutation.isPending ? "Calculating Quote..." : "Get Insurance Quote"}
              </Button>
            </form>
          </Form>

          {quoteResult && (
            <div className="mt-6 p-4 border rounded-lg bg-green-50 dark:bg-green-900">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-3">Your Custom Quote</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Annual Cost Range</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(quoteResult.totalAnnualCost.minimum)} - {formatCurrency(quoteResult.totalAnnualCost.maximum)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Risk Level</p>
                  <Badge className={`${quoteResult.riskLevel === 'low' ? 'bg-green-100 text-green-800' : 
                    quoteResult.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                    {quoteResult.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Contacts */}
      {insuranceRequirements?.providerContacts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Insurance Provider Contacts
            </CardTitle>
            <CardDescription>
              Recommended brokers and carriers for platform insurance coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Insurance Brokers</h4>
                <div className="space-y-3">
                  {insuranceRequirements.providerContacts.brokers.map((broker: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{broker.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{broker.specialty}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">{broker.contact}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={broker.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Insurance Carriers</h4>
                <div className="space-y-3">
                  {insuranceRequirements.providerContacts.carriers.map((carrier: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{carrier.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{carrier.specialty}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">{carrier.contact}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={carrier.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Alert className="mt-6">
              <Shield className="h-4 w-4" />
              <AlertTitle>Insurance Recommendation</AlertTitle>
              <AlertDescription>
                Contact 3-5 providers for comprehensive quotes. Mention TaskParent platform operations 
                and childcare services to ensure proper coverage assessment.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}