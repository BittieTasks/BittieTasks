import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, DollarSign, Calendar, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const taxEstimateSchema = z.object({
  annualRevenue: z.number().min(0, "Revenue must be positive"),
  businessExpenses: z.number().min(0, "Expenses must be positive"),
  payrollExpenses: z.number().min(0, "Payroll expenses must be positive"),
  contractorPayments: z.number().min(0, "Contractor payments must be positive"),
  operatingStates: z.array(z.string()).min(1, "At least one state is required"),
  businessStructure: z.enum(['LLC', 'C-Corp', 'S-Corp']),
});

type TaxEstimateForm = z.infer<typeof taxEstimateSchema>;

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function TaxEstimatorForm() {
  const [estimateResult, setEstimateResult] = useState<any>(null);
  const { toast } = useToast();

  // Fetch tax compliance info
  const { data: taxCompliance, isLoading } = useQuery({
    queryKey: ["/api/legal/tax-compliance"],
  });

  const form = useForm<TaxEstimateForm>({
    resolver: zodResolver(taxEstimateSchema),
    defaultValues: {
      annualRevenue: 5000000,
      businessExpenses: 3500000,
      payrollExpenses: 1000000,
      contractorPayments: 2000000,
      operatingStates: ['CA', 'NY', 'TX', 'FL'],
      businessStructure: 'C-Corp',
    },
  });

  const getTaxEstimateMutation = useMutation({
    mutationFn: async (data: TaxEstimateForm) => {
      return await apiRequest("/api/legal/tax-estimate", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data) => {
      setEstimateResult(data);
      toast({
        title: "Tax Estimate Generated",
        description: "Your tax liability estimate has been calculated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Estimate Generation Failed",
        description: error.message || "Failed to generate tax estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaxEstimateForm) => {
    getTaxEstimateMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p>Loading tax compliance information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="estimator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estimator">Tax Estimator</TabsTrigger>
          <TabsTrigger value="calendar">Compliance Calendar</TabsTrigger>
          <TabsTrigger value="framework">Tax Framework</TabsTrigger>
        </TabsList>

        <TabsContent value="estimator" className="space-y-6">
          {/* Sample Calculation Display */}
          {taxCompliance?.sampleCalculation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  TaskParent Sample Tax Calculation
                </CardTitle>
                <CardDescription>
                  Estimated tax liability for TaskParent platform operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total Annual Tax Liability</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        {formatCurrency(taxCompliance.sampleCalculation.total)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Tax Breakdown:</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Federal Income Tax</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(taxCompliance.sampleCalculation.breakdown.federalIncomeTax)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Employment Taxes</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(taxCompliance.sampleCalculation.breakdown.employmentTaxes)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Self-Employment Tax</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(taxCompliance.sampleCalculation.breakdown.selfEmploymentTax)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-sm">State Tax</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(taxCompliance.sampleCalculation.breakdown.stateTax)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">Federal</p>
                        <p className="text-lg font-bold text-green-800 dark:text-green-200">
                          {formatCurrency(taxCompliance.sampleCalculation.federal)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                        <p className="text-sm text-purple-600 dark:text-purple-400">State</p>
                        <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                          {formatCurrency(taxCompliance.sampleCalculation.state)}
                        </p>
                      </div>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Tax Planning Recommendation</AlertTitle>
                      <AlertDescription>
                        Set aside 25-30% of profits for tax obligations and make quarterly estimated payments.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Tax Estimator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custom Tax Liability Estimator
              </CardTitle>
              <CardDescription>
                Calculate your estimated tax liability based on your specific business parameters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="businessStructure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Structure</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="LLC" id="LLC" />
                              <Label htmlFor="LLC">Limited Liability Company (LLC)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="C-Corp" id="C-Corp" />
                              <Label htmlFor="C-Corp">C-Corporation</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="S-Corp" id="S-Corp" />
                              <Label htmlFor="S-Corp">S-Corporation</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Business structure affects tax treatment and rates
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="annualRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Revenue</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5000000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Gross revenue before expenses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Expenses</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="3500000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Deductible business expenses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="payrollExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payroll Expenses</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1000000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Employee wages and salaries
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contractorPayments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contractor Payments</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2000000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            1099 contractor payments
                          </FormDescription>
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
                          Select all states where you have business operations
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

                  <Button 
                    type="submit" 
                    disabled={getTaxEstimateMutation.isPending}
                    className="w-full"
                  >
                    {getTaxEstimateMutation.isPending ? "Calculating..." : "Calculate Tax Estimate"}
                  </Button>
                </form>
              </Form>

              {estimateResult && (
                <div className="mt-6 p-4 border rounded-lg bg-green-50 dark:bg-green-900">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-3">Your Tax Estimate</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-green-600 dark:text-green-400">Federal Tax</p>
                      <p className="text-lg font-bold text-green-800 dark:text-green-200">
                        {formatCurrency(estimateResult.estimate.federal)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600 dark:text-green-400">State Tax</p>
                      <p className="text-lg font-bold text-green-800 dark:text-green-200">
                        {formatCurrency(estimateResult.estimate.state)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600 dark:text-green-400">Total Tax</p>
                      <p className="text-xl font-bold text-green-800 dark:text-green-200">
                        {formatCurrency(estimateResult.estimate.total)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-green-800 dark:text-green-200">Recommendations:</h4>
                    <ul className="space-y-1">
                      {estimateResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <p className="mt-4 text-xs text-green-600 dark:text-green-400">
                    {estimateResult.disclaimer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tax Compliance Calendar
              </CardTitle>
              <CardDescription>
                Key tax deadlines and filing requirements throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent>
              {taxCompliance?.complianceCalendar && (
                <div className="space-y-4">
                  {taxCompliance.complianceCalendar.map((deadline: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatDate(deadline.date)}</p>
                          <Badge variant={deadline.type === 'federal' ? 'default' : 'secondary'} className="text-xs">
                            {deadline.type}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">{deadline.description}</p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Penalty: {deadline.penalty}
                          </p>
                        </div>
                      </div>
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="framework">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                TaskParent Tax Compliance Framework
              </CardTitle>
              <CardDescription>
                Comprehensive tax compliance strategy for platform operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {taxCompliance?.complianceFramework && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Business Structure</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Recommended:</strong> {taxCompliance.complianceFramework.businessStructure.recommended}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Reasons:</p>
                          <ul className="text-sm space-y-1">
                            {taxCompliance.complianceFramework.businessStructure.reasons.map((reason: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Tax Implications</h3>
                      <ul className="text-sm space-y-1">
                        {taxCompliance.complianceFramework.businessStructure.taxImplications.map((implication: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                            {implication}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Multi-State Compliance</h3>
                      <div className="space-y-2">
                        <Badge className="bg-red-100 text-red-800">
                          Priority: {taxCompliance.complianceFramework.multiStateCompliance.priority}
                        </Badge>
                        <ul className="text-sm space-y-1">
                          {taxCompliance.complianceFramework.multiStateCompliance.requirements.map((req: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Estimated Costs</h3>
                      <div className="space-y-1">
                        {Object.entries(taxCompliance.complianceFramework.multiStateCompliance.estimatedCosts).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Professional Recommendation</AlertTitle>
                    <AlertDescription>
                      {taxCompliance.recommendation}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}