import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Plus, Trash2, CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2-letter code"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
});

const backgroundCheckSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  socialSecurityNumber: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, "Invalid SSN format (XXX-XX-XXXX)"),
  driverLicenseNumber: z.string().optional(),
  driverLicenseState: z.string().length(2).optional(),
  addressHistory: z.array(addressSchema).min(1, "At least one address is required"),
  consent: z.boolean().refine(val => val === true, "Consent is required"),
  checkTypes: z.array(z.enum([
    'criminal_history',
    'sex_offender_registry',
    'child_abuse_registry',
    'motor_vehicle_records',
    'employment_verification',
    'education_verification'
  ])).min(3, "Criminal history, sex offender registry, and child abuse registry checks are required"),
});

type BackgroundCheckForm = z.infer<typeof backgroundCheckSchema>;

const REQUIRED_CHECKS = [
  'criminal_history',
  'sex_offender_registry',
  'child_abuse_registry'
];

const CHECK_DESCRIPTIONS = {
  criminal_history: 'FBI and state criminal background check',
  sex_offender_registry: 'National and state sex offender registry search',
  child_abuse_registry: 'Child abuse and neglect registry check',
  motor_vehicle_records: 'Driving record and vehicle violations',
  employment_verification: 'Previous employment history verification',
  education_verification: 'Educational background verification'
};

export function BackgroundCheckForm() {
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checkId, setCheckId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<BackgroundCheckForm>({
    resolver: zodResolver(backgroundCheckSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      socialSecurityNumber: "",
      driverLicenseNumber: "",
      driverLicenseState: "",
      addressHistory: [
        {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          startDate: "",
          endDate: "",
        }
      ],
      consent: false,
      checkTypes: REQUIRED_CHECKS,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "addressHistory",
  });

  // Check background check status if we have a checkId
  const { data: statusData } = useQuery({
    queryKey: ["/api/legal/background-check", checkId],
    enabled: !!checkId,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const initiateCheckMutation = useMutation({
    mutationFn: async (data: BackgroundCheckForm) => {
      return await apiRequest("/api/legal/background-check", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data) => {
      setCheckResult(data);
      setCheckId(data.checkId);
      toast({
        title: "Background Check Initiated",
        description: "Your background check has been submitted and is being processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Background Check Failed",
        description: error.message || "Failed to initiate background check. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BackgroundCheckForm) => {
    initiateCheckMutation.mutate(data);
  };

  const addAddress = () => {
    append({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      startDate: "",
      endDate: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'clear':
        return <Badge className="bg-green-100 text-green-800">Clear</Badge>;
      case 'flag':
        return <Badge className="bg-yellow-100 text-yellow-800">Flag</Badge>;
      case 'disqualified':
        return <Badge className="bg-red-100 text-red-800">Disqualified</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  // Show status if we have a check in progress
  if (checkResult || statusData) {
    const data = statusData || checkResult;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Background Check Status
          </CardTitle>
          <CardDescription>
            Check ID: {data.checkId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Processing Status</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estimated completion: 3-5 business days
                </p>
              </div>
            </div>
            {getStatusBadge(data.status)}
          </div>

          {data.status === 'completed' && (
            <>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {data.overallResult === 'clear' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">Overall Result</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Background check completed
                    </p>
                  </div>
                </div>
                {getResultBadge(data.overallResult)}
              </div>

              {data.flags && data.flags.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Review Required</AlertTitle>
                  <AlertDescription>
                    This background check has flags that require manual review. 
                    Please contact support for details.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setCheckResult(null);
                setCheckId(null);
                form.reset();
              }}
              variant="outline"
            >
              Start New Check
            </Button>
            
            {data.status === 'completed' && (
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Background Check Application
        </CardTitle>
        <CardDescription>
          Required background verification for childcare task providers on TaskParent platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>Required Safety Verification</AlertTitle>
          <AlertDescription>
            All task providers working with children must complete comprehensive background checks 
            including criminal history, sex offender registry, and child abuse registry searches.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialSecurityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Security Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="XXX-XX-XXXX" 
                        {...field}
                        maxLength={11}
                      />
                    </FormControl>
                    <FormDescription>
                      Required for background check verification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="driverLicenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver's License Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter license number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driverLicenseState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License State (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="CA" 
                        {...field}
                        maxLength={2}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Address History (Past 7 Years)</h3>
                <Button type="button" onClick={addAddress} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Address {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`addressHistory.${index}.street`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`addressHistory.${index}.city`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`addressHistory.${index}.state`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="CA" 
                              {...field}
                              maxLength={2}
                              className="uppercase"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`addressHistory.${index}.zipCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="94105" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`addressHistory.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`addressHistory.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave blank if current address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Background Check Types</h3>
              <FormField
                control={form.control}
                name="checkTypes"
                render={() => (
                  <FormItem>
                    <div className="space-y-3">
                      {Object.entries(CHECK_DESCRIPTIONS).map(([key, description]) => {
                        const isRequired = REQUIRED_CHECKS.includes(key);
                        return (
                          <FormField
                            key={key}
                            control={form.control}
                            name="checkTypes"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(key as any)}
                                      onCheckedChange={(checked) => {
                                        if (!isRequired) {
                                          return checked
                                            ? field.onChange([...field.value, key])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== key
                                                )
                                              );
                                        }
                                      }}
                                      disabled={isRequired}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="flex items-center gap-2">
                                      {description}
                                      {isRequired && (
                                        <Badge variant="secondary" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="consent"
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
                      I consent to the background check and understand that this information 
                      will be used for safety verification purposes.
                    </FormLabel>
                    <FormDescription>
                      Required consent for background check processing
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={initiateCheckMutation.isPending}
              className="w-full"
            >
              {initiateCheckMutation.isPending ? "Submitting..." : "Submit Background Check"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}