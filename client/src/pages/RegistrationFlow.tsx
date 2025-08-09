import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  User, 
  MapPin, 
  FileText, 
  CheckCircle, 
  Crown,
  Zap,
  Users,
  ArrowRight,
  Loader2
} from 'lucide-react';

// Registration steps
type RegistrationStep = 'signup' | 'verification' | 'profile' | 'plan' | 'complete';

// Form schemas
const signupSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  location: z.string().min(1, 'Location is required').max(200),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;

interface PlanOption {
  id: string;
  name: string;
  price: number;
  taskLimit: number;
  platformFee: number;
  features: string[];
  popular?: boolean;
}

const plans: PlanOption[] = [
  {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    taskLimit: 5,
    platformFee: 10,
    features: ['5 tasks per month', 'Basic support', 'Community access']
  },
  {
    id: 'pro',
    name: 'Pro Earner',
    price: 9.99,
    taskLimit: 50,
    platformFee: 7,
    features: ['50 tasks per month', 'Priority support', 'Lower fees', 'Ad-free experience'],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium Host',
    price: 19.99,
    taskLimit: -1,
    platformFee: 5,
    features: ['Unlimited tasks', '24/7 support', 'Lowest fees', 'Exclusive features', 'Premium badge']
  }
];

export default function RegistrationFlow() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('signup');
  const [userEmail, setUserEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [isVerifying, setIsVerifying] = useState(false);

  // Form instances
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      location: '',
      bio: ''
    }
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/registration?step=verification`
        }
      });

      if (error) throw error;
      return authData;
    },
    onSuccess: (data) => {
      setUserEmail(signupForm.getValues('email'));
      setCurrentStep('verification');
      toast({
        title: "Account Created",
        description: "Please check your email for verification link",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  });

  // Profile setup mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest('POST', '/api/user/profile', data);
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep('plan');
      toast({
        title: "Profile Created",
        description: "Your profile has been set up successfully",
      });
    }
  });

  // Plan selection mutation
  const planMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest('POST', '/api/subscription/select', {
        planId,
        userEmail
      });
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep('complete');
      toast({
        title: "Registration Complete",
        description: "Welcome to BittieTasks! You're ready to start earning.",
      });
    }
  });

  // Email verification check
  const checkVerification = async () => {
    setIsVerifying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setCurrentStep('profile');
        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully",
        });
      } else {
        toast({
          title: "Not Verified Yet",
          description: "Please check your email and click the verification link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to check verification status",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 1: Signup
  if (currentStep === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Join BittieTasks</CardTitle>
            <p className="text-muted-foreground">
              Start earning by sharing tasks with your community
            </p>
          </CardHeader>
          
          <CardContent>
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit((data) => signupMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input {...field} type="email" className="pl-10" placeholder="you@example.com" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Create a strong password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Confirm your password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Email Verification
  if (currentStep === 'verification') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <p className="text-muted-foreground">
              We sent a verification link to:<br />
              <span className="font-medium">{userEmail}</span>
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Click the link in your email to verify your account and continue registration.
              </p>
            </div>
            
            <Button 
              onClick={checkVerification}
              className="w-full"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Profile Setup
  if (currentStep === 'profile') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle>Complete Your Profile</CardTitle>
            <p className="text-muted-foreground">
              Help your community get to know you better
            </p>
          </CardHeader>
          
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit((data) => profileMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" placeholder="City, State or Neighborhood" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Tell your community about yourself, your interests, or skills you'd like to share..."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Plan Selection
  if (currentStep === 'plan') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">
              Select the plan that fits your earning goals
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                } ${plan.popular ? 'border-blue-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 hover:bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    {plan.id === 'free' && <Users className="w-8 h-8 text-gray-500" />}
                    {plan.id === 'pro' && <Zap className="w-8 h-8 text-blue-500" />}
                    {plan.id === 'premium' && <Crown className="w-8 h-8 text-purple-500" />}
                  </div>
                  
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {plan.platformFee}% platform fee
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {plan.taskLimit === -1 ? 'Unlimited' : plan.taskLimit} tasks/month
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => planMutation.mutate(selectedPlan)}
              disabled={planMutation.isPending}
              className="min-w-[200px]"
            >
              {planMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  {selectedPlan === 'free' ? 'Get Started Free' : 'Continue with Plan'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Complete
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to BittieTasks!</CardTitle>
            <p className="text-muted-foreground">
              Your account is set up and ready to go
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Next Steps:
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Browse available tasks in your area</li>
                <li>• Create your first shared task</li>
                <li>• Connect with your community</li>
                <li>• Start earning money today</li>
              </ul>
            </div>
            
            <Button 
              size="lg"
              className="w-full"
              onClick={() => window.location.href = '/platform'}
            >
              Enter Platform
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}