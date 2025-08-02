import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Phone, Shield, Plus, Trash2, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const involvedPartySchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  role: z.enum(['task_provider', 'task_requester', 'child', 'other']),
  age: z.number().optional(),
});

const witnessSchema = z.object({
  name: z.string().min(1, "Witness name is required"),
  contact: z.string().min(1, "Contact information is required"),
  statement: z.string().optional(),
});

const incidentReportSchema = z.object({
  incidentType: z.enum([
    'child_injury',
    'child_abuse_suspected',
    'property_damage',
    'safety_violation',
    'inappropriate_behavior',
    'emergency_situation',
    'background_check_issue',
    'platform_misuse',
    'other'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2-letter code'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  }),
  dateTime: z.string().transform(str => new Date(str)),
  involvedParties: z.array(involvedPartySchema).min(1, 'At least one involved party is required'),
  witnesses: z.array(witnessSchema).optional(),
  emergencyServices: z.object({
    called: z.boolean(),
    services: z.array(z.enum(['police', 'fire', 'ambulance', 'child_services'])).optional(),
    reportNumbers: z.array(z.string()).optional(),
  }),
  immediateActions: z.string().min(10, 'Describe immediate actions taken'),
});

type IncidentReportForm = z.infer<typeof incidentReportSchema>;

const INCIDENT_TYPES = {
  child_injury: 'Child Injury',
  child_abuse_suspected: 'Suspected Child Abuse',
  property_damage: 'Property Damage',
  safety_violation: 'Safety Violation',
  inappropriate_behavior: 'Inappropriate Behavior',
  emergency_situation: 'Emergency Situation',
  background_check_issue: 'Background Check Issue',
  platform_misuse: 'Platform Misuse',
  other: 'Other'
};

const SEVERITY_LEVELS = {
  low: { label: 'Low', color: 'text-green-600', description: 'Minor incident with no injury' },
  medium: { label: 'Medium', color: 'text-yellow-600', description: 'Moderate incident requiring attention' },
  high: { label: 'High', color: 'text-orange-600', description: 'Serious incident requiring immediate action' },
  critical: { label: 'Critical', color: 'text-red-600', description: 'Life-threatening or emergency situation' }
};

export function IncidentReportForm() {
  const [reportResult, setReportResult] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<IncidentReportForm>({
    resolver: zodResolver(incidentReportSchema),
    defaultValues: {
      incidentType: 'other',
      severity: 'medium',
      title: "",
      description: "",
      location: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      dateTime: new Date().toISOString().slice(0, 16),
      involvedParties: [
        {
          userId: "",
          name: "",
          role: 'other',
          age: undefined,
        }
      ],
      witnesses: [],
      emergencyServices: {
        called: false,
        services: [],
        reportNumbers: [],
      },
      immediateActions: "",
    },
  });

  const { fields: involvedFields, append: appendInvolved, remove: removeInvolved } = useFieldArray({
    control: form.control,
    name: "involvedParties",
  });

  const { fields: witnessFields, append: appendWitness, remove: removeWitness } = useFieldArray({
    control: form.control,
    name: "witnesses",
  });

  const submitReportMutation = useMutation({
    mutationFn: async (data: IncidentReportForm) => {
      return await apiRequest("/api/legal/incident-report", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data) => {
      setReportResult(data);
      toast({
        title: "Incident Report Submitted",
        description: "Your incident report has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Report Submission Failed",
        description: error.message || "Failed to submit incident report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncidentReportForm) => {
    submitReportMutation.mutate(data);
  };

  const watchedIncidentType = form.watch("incidentType");
  const isCriticalIncident = ['child_injury', 'child_abuse_suspected', 'emergency_situation'].includes(watchedIncidentType);

  if (reportResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Incident Report Submitted
          </CardTitle>
          <CardDescription>
            Report ID: {reportResult.incidentId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Report Status: {reportResult.status}</p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Severity: {reportResult.severity} | Mandatory Reporting: {reportResult.mandatoryReporting ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            
            {reportResult.mandatoryReporting && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Mandatory Reporting Initiated</AlertTitle>
                <AlertDescription>
                  This incident requires mandatory reporting to authorities. Relevant agencies have been notified automatically.
                </AlertDescription>
              </Alert>
            )}
            
            {reportResult.nextSteps && (
              <div className="space-y-2">
                <h3 className="font-medium">Next Steps:</h3>
                <ul className="space-y-1">
                  {reportResult.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              onClick={() => {
                setReportResult(null);
                form.reset();
              }}
              variant="outline"
            >
              Submit Another Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Incident Report Form
        </CardTitle>
        <CardDescription>
          Report safety incidents, violations, or emergencies on the TaskParent platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Phone className="h-4 w-4" />
          <AlertTitle>Emergency Situations</AlertTitle>
          <AlertDescription>
            For immediate emergencies, call 911 first. For platform safety emergencies, call our hotline: 1-800-TASK-911
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="incidentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SEVERITY_LEVELS).map(([key, { label, color, description }]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span className={color}>●</span>
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {SEVERITY_LEVELS[form.watch("severity")]?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isCriticalIncident && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Critical Incident Alert</AlertTitle>
                <AlertDescription>
                  This incident type requires immediate escalation and may trigger mandatory reporting to authorities.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary of the incident" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed description of what happened, including timeline and circumstances..."
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include as much detail as possible. This information is crucial for investigation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date and Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        max={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="location.city"
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
                name="location.state"
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
                name="location.zipCode"
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Involved Parties</h3>
                <Button 
                  type="button" 
                  onClick={() => appendInvolved({ userId: "", name: "", role: 'other', age: undefined })}
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Person
                </Button>
              </div>

              {involvedFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Person {index + 1}</h4>
                    {involvedFields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeInvolved(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`involvedParties.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (if known)</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`involvedParties.${index}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="task_provider">Task Provider</SelectItem>
                              <SelectItem value="task_requester">Task Requester</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`involvedParties.${index}.age`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (if known)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Age"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="emergencyServices.called"
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
                        Emergency services were called (911, police, fire, ambulance, etc.)
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("emergencyServices.called") && (
                <div className="pl-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="emergencyServices.services"
                    render={() => (
                      <FormItem>
                        <FormLabel>Which services were called?</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {['police', 'fire', 'ambulance', 'child_services'].map((service) => (
                            <FormField
                              key={service}
                              control={form.control}
                              name="emergencyServices.services"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(service as any)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), service])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== service
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="capitalize">
                                      {service.replace('_', ' ')}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="immediateActions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Immediate Actions Taken</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what immediate actions were taken in response to this incident..."
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include first aid provided, safety measures implemented, notifications made, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={submitReportMutation.isPending}
              className="w-full"
            >
              {submitReportMutation.isPending ? "Submitting Report..." : "Submit Incident Report"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}