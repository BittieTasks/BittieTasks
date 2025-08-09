import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import PaymentFlow from './PaymentFlow';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Target, 
  CheckCircle, 
  Star,
  Globe,
  Heart,
  Leaf,
  Award
} from 'lucide-react';

const sponsorshipSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactEmail: z.string().email('Valid email is required'),
  taskTitle: z.string().min(1, 'Task title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targetParticipants: z.number().min(5, 'Minimum 5 participants required'),
  sponsorshipAmount: z.number().min(50, 'Minimum sponsorship is $50'),
  communityBonus: z.number().min(10, 'Minimum community bonus is $10'),
  ethicalCommitment: z.string().min(20, 'Please describe your ethical commitment')
});

type SponsorshipFormData = z.infer<typeof sponsorshipSchema>;

interface SponsoredTask {
  id: string;
  title: string;
  description: string;
  sponsorName: string;
  sponsorLogo?: string;
  sponsorshipAmount: number;
  communityBonus: number;
  targetParticipants: number;
  currentParticipants: number;
  ethicsScore: number;
  categories: string[];
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
}

interface EthicalPartner {
  id: string;
  name: string;
  logo: string;
  ethicsScore: number;
  commitments: string[];
  activeTasks: number;
  totalContribution: number;
}

export default function CorporateSponsorship() {
  const { toast } = useToast();
  const [showSponsorshipForm, setShowSponsorshipForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SponsoredTask | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  const { data: sponsoredTasks = [] } = useQuery({
    queryKey: ['/api/sponsored-tasks'],
    queryFn: () => apiRequest('GET', '/api/sponsored-tasks').then(res => res.json())
  });

  const { data: ethicalPartners = [] } = useQuery({
    queryKey: ['/api/ethical-partners'],
    queryFn: () => apiRequest('GET', '/api/ethical-partners').then(res => res.json())
  });

  const createSponsorshipMutation = useMutation({
    mutationFn: (data: SponsorshipFormData) => apiRequest('POST', '/api/create-sponsorship', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sponsored-tasks'] });
      setShowSponsorshipForm(false);
      form.reset();
      toast({
        title: "Sponsorship Submitted",
        description: "Your sponsorship proposal is under ethical review.",
      });
    }
  });

  const form = useForm<SponsorshipFormData>({
    resolver: zodResolver(sponsorshipSchema),
    defaultValues: {
      companyName: '',
      contactEmail: '',
      taskTitle: '',
      description: '',
      targetParticipants: 10,
      sponsorshipAmount: 100,
      communityBonus: 25,
      ethicalCommitment: ''
    }
  });

  const onSubmit = (data: SponsorshipFormData) => {
    createSponsorshipMutation.mutate(data);
  };

  const handleJoinSponsoredTask = (task: SponsoredTask) => {
    setSelectedTask(task);
    setShowPaymentFlow(true);
  };

  // Mock data for demonstration
  const mockSponsoredTasks: SponsoredTask[] = [
    {
      id: '1',
      title: 'Community Garden Workshop',
      description: 'Learn sustainable gardening techniques while building community connections. Sponsored by EcoGreen Solutions.',
      sponsorName: 'EcoGreen Solutions',
      sponsorshipAmount: 200,
      communityBonus: 50,
      targetParticipants: 15,
      currentParticipants: 8,
      ethicsScore: 95,
      categories: ['Education', 'Environment', 'Community'],
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Youth Coding Bootcamp',
      description: 'Free coding workshop for kids ages 8-16. Learn programming basics in a fun, supportive environment.',
      sponsorName: 'TechForGood Inc',
      sponsorshipAmount: 500,
      communityBonus: 100,
      targetParticipants: 20,
      currentParticipants: 12,
      ethicsScore: 92,
      categories: ['Education', 'Technology', 'Youth'],
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];

  const mockEthicalPartners: EthicalPartner[] = [
    {
      id: '1',
      name: 'EcoGreen Solutions',
      logo: '🌱',
      ethicsScore: 95,
      commitments: ['Carbon Neutral', 'Fair Labor', 'Community Investment'],
      activeTasks: 3,
      totalContribution: 2500
    },
    {
      id: '2',
      name: 'TechForGood Inc',
      logo: '💻',
      ethicsScore: 92,
      commitments: ['Digital Equity', 'Privacy First', 'Open Source'],
      activeTasks: 2,
      totalContribution: 1800
    }
  ];

  if (showPaymentFlow && selectedTask) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => setShowPaymentFlow(false)}
          className="mb-6"
        >
          ← Back to Sponsored Tasks
        </Button>
        
        <PaymentFlow
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          totalAmount={selectedTask.sponsorshipAmount + selectedTask.communityBonus}
          participants={[
            { id: 'user-1', name: 'Current User', email: 'user@example.com' }
          ]}
          paymentType="sponsorship"
          sponsorInfo={{
            name: selectedTask.sponsorName,
            sponsorshipAmount: selectedTask.sponsorshipAmount,
            communityBonus: selectedTask.communityBonus
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Corporate Partnerships</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Ethical companies sponsoring community tasks for shared value
          </p>
        </div>
        
        <Dialog open={showSponsorshipForm} onOpenChange={setShowSponsorshipForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Propose Sponsorship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Corporate Sponsorship Proposal</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="taskTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsored Task Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Task Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="targetParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Participants</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sponsorshipAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsorship ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="communityBonus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Bonus ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="ethicalCommitment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ethical Commitment Statement</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your company's commitment to ethical practices, community values, and social responsibility..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowSponsorshipForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createSponsorshipMutation.isPending}
                  >
                    {createSponsorshipMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="sponsored-tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sponsored-tasks">Sponsored Tasks</TabsTrigger>
          <TabsTrigger value="ethical-partners">Ethical Partners</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sponsored-tasks" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {mockSponsoredTasks.map((task) => (
              <Card key={task.id} className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Ethics Score: {task.ethicsScore}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < task.ethicsScore / 20 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>Sponsored by {task.sponsorName}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {task.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {task.categories.map(category => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>Sponsorship: ${task.sponsorshipAmount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Bonus: ${task.communityBonus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{task.currentParticipants}/{task.targetParticipants} joined</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Total: ${task.sponsorshipAmount + task.communityBonus}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handleJoinSponsoredTask(task)}
                      disabled={task.currentParticipants >= task.targetParticipants}
                    >
                      {task.currentParticipants >= task.targetParticipants ? (
                        'Task Full'
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Join Sponsored Task
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="ethical-partners" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockEthicalPartners.map((partner) => (
              <Card key={partner.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                      {partner.logo}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Award className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          Ethics Score: {partner.ethicsScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Ethical Commitments</h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.commitments.map((commitment, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {commitment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Active Tasks</span>
                      <p className="font-medium">{partner.activeTasks}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Contribution</span>
                      <p className="font-medium text-green-600">${partner.totalContribution.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Globe className="w-4 h-4 mr-2" />
                    View Partner Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}