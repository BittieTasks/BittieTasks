import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, AlertTriangle, CheckCircle, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const ageVerificationSchema = z.object({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  verificationMethod: z.enum(['id_document', 'parental_consent', 'credit_card']),
  parentalConsent: z.boolean().optional(),
  parentEmail: z.string().email().optional(),
  parentName: z.string().min(2).optional(),
}).refine((data) => {
  const age = calculateAge(data.dateOfBirth);
  if (age < 18 && age >= 13) {
    return data.parentalConsent && data.parentEmail && data.parentName;
  }
  return true;
}, {
  message: "Parental consent and contact information required for users under 18",
  path: ["parentalConsent"],
});

type AgeVerificationForm = z.infer<typeof ageVerificationSchema>;

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function AgeVerificationForm() {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showParentalFields, setShowParentalFields] = useState(false);
  const { toast } = useToast();

  const form = useForm<AgeVerificationForm>({
    resolver: zodResolver(ageVerificationSchema),
    defaultValues: {
      dateOfBirth: "",
      verificationMethod: "id_document",
      parentalConsent: false,
      parentEmail: "",
      parentName: "",
    },
  });

  const verifyAgeMutation = useMutation({
    mutationFn: async (data: AgeVerificationForm) => {
      return await apiRequest("/api/legal/age-verification", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      toast({
        title: "Age Verification Complete",
        description: "Age verification has been successfully completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Age verification failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AgeVerificationForm) => {
    verifyAgeMutation.mutate(data);
  };

  const watchedDateOfBirth = form.watch("dateOfBirth");
  
  // Check if user is a minor when date changes
  React.useEffect(() => {
    if (watchedDateOfBirth) {
      const age = calculateAge(watchedDateOfBirth);
      setShowParentalFields(age >= 13 && age < 18);
      
      if (age < 13) {
        toast({
          title: "Age Restriction",
          description: "Users under 13 are not permitted to use this platform due to COPPA regulations.",
          variant: "destructive",
        });
      }
    }
  }, [watchedDateOfBirth, toast]);

  if (verificationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Age Verification Complete
          </CardTitle>
          <CardDescription>
            Your age has been successfully verified and you meet platform requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">COPPA Compliant</p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Platform compliance with Children's Online Privacy Protection Act
                </p>
              </div>
            </div>
            
            {verificationResult.isMinor && (
              <Alert>
                <UserCheck className="h-4 w-4" />
                <AlertTitle>Minor User Protections Active</AlertTitle>
                <AlertDescription>
                  Enhanced privacy protections and parental oversight are now active for this account.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={() => {
                setVerificationResult(null);
                form.reset();
              }}
              variant="outline"
            >
              Verify Another User
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
          <Shield className="h-5 w-5" />
          Age Verification & COPPA Compliance
        </CardTitle>
        <CardDescription>
          Required age verification to comply with federal privacy laws and platform safety requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>COPPA Compliance Notice</AlertTitle>
          <AlertDescription>
            Users under 13 are prohibited from using this platform. Users 13-17 require parental consent.
            This verification helps us comply with the Children's Online Privacy Protection Act.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormDescription>
                    Enter your date of birth for age verification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="verificationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="id_document" id="id_document" />
                        <Label htmlFor="id_document">Government-issued ID Document</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="parental_consent" id="parental_consent" />
                        <Label htmlFor="parental_consent">Parental Consent (for minors)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card">Credit Card Verification</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showParentalFields && (
              <div className="space-y-4 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-800 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Parental Consent Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  As you are under 18, we need parental consent to comply with privacy laws.
                </p>

                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parent's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="parent@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        We'll send a verification email to this address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentalConsent"
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
                          Parental consent granted for platform use
                        </FormLabel>
                        <FormDescription>
                          I confirm that I am the parent/guardian and consent to my child's use of this platform
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={verifyAgeMutation.isPending}
              className="w-full"
            >
              {verifyAgeMutation.isPending ? "Verifying..." : "Verify Age"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}