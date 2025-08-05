import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, CheckCircle, AlertTriangle, Users, Leaf, Shield, Heart } from "lucide-react";

const companyApplicationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  proposedTaskType: z.string().min(5, "Task type must be at least 5 characters"),
  proposedPayment: z.number().min(20, "Minimum payment is $20 per participant"),
  taskDescription: z.string().min(20, "Task description must be at least 20 characters"),
  targetAudience: z.string().min(5, "Please describe your target audience"),
  expectedParticipants: z.number().min(5, "Minimum 5 expected participants"),
  ethicalCriteria: z.object({
    hrcScore: z.number().min(0).max(100),
    deiLeadership: z.boolean(),
    lgbtqSupport: z.boolean(),
    environmentalScore: z.number().min(0).max(100),
    laborPracticesScore: z.number().min(0).max(100),
    communityInvestment: z.boolean(),
    controversyScore: z.number().min(0).max(100),
    carbonNeutralCommitment: z.boolean(),
    supplierDiversityProgram: z.boolean()
  })
});

type CompanyApplicationForm = z.infer<typeof companyApplicationSchema>;

const taskProposalSchema = z.object({
  companyName: z.string().min(2, "Company name required"),
  taskProposal: z.object({
    title: z.string().min(5, "Task title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    payment: z.number().min(20, "Minimum payment is $20"),
    targetAudience: z.string().min(5, "Please describe target audience"),
    expectedParticipants: z.number().min(5, "Minimum 5 participants"),
    duration: z.string().min(3, "Please specify duration"),
    requirements: z.array(z.string()).optional()
  })
});

type TaskProposalForm = z.infer<typeof taskProposalSchema>;

export default function CompanyApplication() {
  const [activeTab, setActiveTab] = useState<'application' | 'task-proposal'>('application');
  const [applicationResult, setApplicationResult] = useState<any>(null);
  const [taskProposalResult, setTaskProposalResult] = useState<any>(null);
  const { toast } = useToast();

  const companyForm = useForm<CompanyApplicationForm>({
    resolver: zodResolver(companyApplicationSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      proposedTaskType: "",
      proposedPayment: 35,
      taskDescription: "",
      targetAudience: "",
      expectedParticipants: 20,
      ethicalCriteria: {
        hrcScore: 50,
        deiLeadership: false,
        lgbtqSupport: false,
        environmentalScore: 50,
        laborPracticesScore: 50,
        communityInvestment: false,
        controversyScore: 50,
        carbonNeutralCommitment: false,
        supplierDiversityProgram: false
      }
    }
  });

  const taskForm = useForm<TaskProposalForm>({
    resolver: zodResolver(taskProposalSchema),
    defaultValues: {
      companyName: "",
      taskProposal: {
        title: "",
        description: "",
        payment: 35,
        targetAudience: "",
        expectedParticipants: 20,
        duration: "1-2 hours",
        requirements: []
      }
    }
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: CompanyApplicationForm) => {
      return await apiRequest("POST", "/api/ethical-partners/apply", data);
    },
    onSuccess: (result) => {
      setApplicationResult(result);
      toast({
        title: result.status === 'approved' ? "Application Approved!" : "Application Needs Improvement",
        description: result.message,
        variant: result.status === 'approved' ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Application Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const taskProposalMutation = useMutation({
    mutationFn: async (data: TaskProposalForm) => {
      return await apiRequest("POST", "/api/ethical-partners/propose-task", data);
    },
    onSuccess: (result) => {
      setTaskProposalResult(result);
      toast({
        title: "Task Proposal Submitted",
        description: result.message,
      });
      taskForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Proposal Error", 
        description: "Failed to submit task proposal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onApplicationSubmit = (data: CompanyApplicationForm) => {
    applicationMutation.mutate(data);
  };

  const onTaskProposalSubmit = (data: TaskProposalForm) => {
    taskProposalMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Corporate Partnership Portal</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join BittieTasks as an ethical corporate partner. Submit your company for evaluation or propose custom tasks for our community.
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <Button 
          variant={activeTab === 'application' ? 'default' : 'outline'}
          onClick={() => setActiveTab('application')}
        >
          <Building2 className="h-4 w-4 mr-2" />
          Partnership Application
        </Button>
        <Button 
          variant={activeTab === 'task-proposal' ? 'default' : 'outline'}
          onClick={() => setActiveTab('task-proposal')}
        >
          <Users className="h-4 w-4 mr-2" />
          Propose Custom Task
        </Button>
      </div>

      {activeTab === 'application' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partnership Application</CardTitle>
              <CardDescription>
                Apply to become an approved ethical partner with BittieTasks. We evaluate companies based on diversity, 
                equity, inclusion, environmental responsibility, and ethical business practices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onApplicationSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
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
                      control={companyForm.control}
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
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
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

                  <FormField
                    control={companyForm.control}
                    name="proposedTaskType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Task Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Family Fitness Challenge, Community Shopping Experience" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="taskDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the proposed task activity, what participants will do, and how it benefits families..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="proposedPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment per Participant ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={20}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Families with children 5-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="expectedParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Participants</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={5}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ethical Criteria Assessment</h3>
                    <p className="text-sm text-gray-600">
                      Please provide accurate information about your company's ethical practices. This will be verified during our evaluation process.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={companyForm.control}
                          name="ethicalCriteria.hrcScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                HRC Corporate Equality Index Score (0-100)
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
                                    <Badge variant={field.value >= 80 ? "default" : "secondary"}>
                                      {field.value}/100
                                    </Badge>
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Human Rights Campaign's measure of LGBTQ+ workplace equality
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
                          name="ethicalCriteria.environmentalScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Leaf className="h-4 w-4" />
                                Environmental Responsibility Score (0-100)
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
                                    <Badge variant={field.value >= 60 ? "default" : "secondary"}>
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
                          control={companyForm.control}
                          name="ethicalCriteria.laborPracticesScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Labor Practices Score (0-100)
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
                          control={companyForm.control}
                          name="ethicalCriteria.deiLeadership"
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
                                  Diversity, Equity & Inclusion Leadership
                                </FormLabel>
                                <FormDescription>
                                  Company has documented DEI programs and leadership
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
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
                                  LGBTQ+ Workplace Support
                                </FormLabel>
                                <FormDescription>
                                  Supports LGBTQ+ rights and workplace equality
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
                          name="ethicalCriteria.communityInvestment"
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
                                  Community Investment
                                </FormLabel>
                                <FormDescription>
                                  Invests in underrepresented communities
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
                          name="ethicalCriteria.carbonNeutralCommitment"
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
                                  Carbon Neutral Commitment
                                </FormLabel>
                                <FormDescription>
                                  Has carbon neutral or negative commitment
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
                          name="ethicalCriteria.supplierDiversityProgram"
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
                                  Supplier Diversity Program
                                </FormLabel>
                                <FormDescription>
                                  Has programs supporting diverse suppliers
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={applicationMutation.isPending}
                  >
                    {applicationMutation.isPending ? "Evaluating..." : "Submit Partnership Application"}
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
                <Badge variant={applicationResult.status === 'approved' ? 'default' : 'destructive'}>
                  {applicationResult.status === 'approved' ? 'Approved' : 'Needs Improvement'}
                </Badge>
                <p>{applicationResult.message}</p>
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
        </div>
      )}

      {activeTab === 'task-proposal' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Propose Custom Task</CardTitle>
              <CardDescription>
                Already an approved partner? Submit a custom task proposal for our community to review and approve.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...taskForm}>
                <form onSubmit={taskForm.handleSubmit(onTaskProposalSubmit)} className="space-y-6">
                  <FormField
                    control={taskForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name (Must be approved partner)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your approved company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={taskForm.control}
                    name="taskProposal.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Family Yoga Session in the Park" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={taskForm.control}
                    name="taskProposal.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of the task, what participants will do, materials needed, expected outcomes..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="taskProposal.payment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment per Participant ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={20}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taskForm.control}
                      name="taskProposal.duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1-2 hours, 30 minutes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="taskProposal.targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Parents with toddlers, Active families" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taskForm.control}
                      name="taskProposal.expectedParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Participants</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={5}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={taskProposalMutation.isPending}
                  >
                    {taskProposalMutation.isPending ? "Submitting..." : "Submit Task Proposal"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {taskProposalResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Task Proposal Submitted
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge>Under Review</Badge>
                <p>{taskProposalResult.message}</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Estimated Review Time:</h4>
                  <p className="text-sm">{taskProposalResult.estimatedReviewTime}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}