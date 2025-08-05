import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Phone, IdCard, Camera, Shield, Fingerprint, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerificationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');

  // Get current verification status
  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ['/api/verification/status'],
    retry: false
  });

  // Phone verification mutations
  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/verification/phone/send-code', {
        phoneNumber,
        userId: 'demo-user-id' // In real app, get from auth context
      });
      return response;
    },
    onSuccess: (data) => {
      setSentCode(data.code); // For demo - remove in production
      toast({
        title: "Verification Code Sent",
        description: `Code sent to ${phoneNumber}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Code",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyPhoneMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/verification/phone/verify', {
        userId: 'demo-user-id',
        verificationCode
      });
    },
    onSuccess: () => {
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
      setVerificationCode('');
      setPhoneNumber('');
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Identity document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('documents', file);
      formData.append('documentType', 'drivers_license');
      
      // Simulate upload for demo
      await apiRequest('POST', '/api/verification/upload-identity', {
        userId: 'demo-user-id',
        documentType: 'drivers_license',
        documentData: 'demo_document_data'
      });
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Your identity document has been uploaded for review",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
    }
  });

  // Face verification mutation
  const faceVerificationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/verification/verify-face', {
        userId: 'demo-user-id',
        faceData: 'demo_face_data',
        livenessData: 'demo_liveness_data'
      });
    },
    onSuccess: () => {
      toast({
        title: "Face Verification Complete",
        description: "Your face verification has been completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
    }
  });

  // Behavior analysis mutation
  const behaviorAnalysisMutation = useMutation({
    mutationFn: async () => {
      // Simulate collecting behavior data
      const behaviorData = {
        mouseMovements: Array.from({length: 50}, (_, i) => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          timestamp: Date.now() + i * 100,
          deltaX: (Math.random() - 0.5) * 10,
          deltaY: (Math.random() - 0.5) * 10
        })),
        keystrokes: Array.from({length: 20}, (_, i) => ({
          key: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          timestamp: Date.now() + i * 150 + Math.random() * 50,
          duration: 50 + Math.random() * 100
        })),
        sessionTime: 300 + Math.random() * 600
      };

      await apiRequest('POST', '/api/verification/analyze-behavior', {
        userId: 'demo-user-id',
        behaviorData
      });
    },
    onSuccess: () => {
      toast({
        title: "Behavior Analysis Complete",
        description: "Your interaction patterns have been analyzed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const overallScore = verificationStatus?.overallScore || 0;
  const level = verificationStatus?.level || 'basic';
  const verifications = verificationStatus?.verifications || {};

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      basic: 'secondary',
      standard: 'default',
      premium: 'default'
    } as const;
    
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-green-100 text-green-800'
    };

    return (
      <Badge variant={variants[level as keyof typeof variants]} className={colors[level as keyof typeof colors]}>
        {level.charAt(0).toUpperCase() + level.slice(1)} Verification
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Human Verification Center</h1>
        <p className="text-muted-foreground">
          Complete verification steps to ensure all BittieTasks users are real people
        </p>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verification Score</span>
            {getLevelBadge(level)}
          </CardTitle>
          <CardDescription>
            Your overall human verification score based on completed verification steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}/100
              </span>
              <span className="text-sm text-muted-foreground">
                {verificationStatus?.riskLevel === 'low' ? '🟢 Low Risk' : 
                 verificationStatus?.riskLevel === 'medium' ? '🟡 Medium Risk' : '🔴 High Risk'}
              </span>
            </div>
            <Progress value={overallScore} className="w-full" />
            {verificationStatus?.requirements?.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Required Steps:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                  {verificationStatus.requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Phone Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Verification
              {verifications.phone && <CheckCircle className="h-5 w-5 text-green-600" />}
            </CardTitle>
            <CardDescription>
              Verify your phone number with an SMS code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verifications.phone ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => sendCodeMutation.mutate()} 
                  disabled={!phoneNumber || sendCodeMutation.isPending}
                  className="w-full"
                >
                  {sendCodeMutation.isPending ? 'Sending...' : 'Send Verification Code'}
                </Button>
                
                {sentCode && (
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Demo code: {sentCode}
                    </p>
                    <Button 
                      onClick={() => verifyPhoneMutation.mutate()}
                      disabled={!verificationCode || verifyPhoneMutation.isPending}
                      className="w-full"
                    >
                      {verifyPhoneMutation.isPending ? 'Verifying...' : 'Verify Code'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Phone Verified</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Identity Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              Identity Documents
              {verifications.identity && <CheckCircle className="h-5 w-5 text-green-600" />}
            </CardTitle>
            <CardDescription>
              Upload government-issued ID for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verifications.identity ? (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <IdCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload driver's license, passport, or state ID
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadDocumentMutation.mutate(file);
                    }}
                    className="hidden"
                    id="document-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('document-upload')?.click()}
                    disabled={uploadDocumentMutation.isPending}
                  >
                    {uploadDocumentMutation.isPending ? 'Uploading...' : 'Choose File'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Identity Verified</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Face Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Face Verification
              {verifications.face && <CheckCircle className="h-5 w-5 text-green-600" />}
            </CardTitle>
            <CardDescription>
              Complete face verification and liveness check
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verifications.face ? (
              <>
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">
                    Look directly at the camera and follow prompts
                  </p>
                  <Button 
                    onClick={() => faceVerificationMutation.mutate()}
                    disabled={faceVerificationMutation.isPending}
                    className="w-full"
                  >
                    {faceVerificationMutation.isPending ? 'Verifying...' : 'Start Face Verification'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Face Verified</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Behavior Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Behavior Analysis
              {verifications.behavior && <CheckCircle className="h-5 w-5 text-green-600" />}
            </CardTitle>
            <CardDescription>
              Analyze interaction patterns to verify human behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verifications.behavior ? (
              <>
                <div className="text-center">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">
                    Complete natural interaction tasks
                  </p>
                  <Button 
                    onClick={() => behaviorAnalysisMutation.mutate()}
                    disabled={behaviorAnalysisMutation.isPending}
                    className="w-full"
                  >
                    {behaviorAnalysisMutation.isPending ? 'Analyzing...' : 'Start Behavior Analysis'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Behavior Verified</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Why We Verify Users
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                BittieTasks requires comprehensive human verification to ensure a safe community. 
                All users must be verified as real people to prevent bots, fraud, and protect family safety.
                Your verification data is encrypted and used only for identity confirmation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}