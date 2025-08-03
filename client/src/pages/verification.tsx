import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Phone, Mail, FileCheck, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  backgroundChecked: boolean;
  trustScore: number;
  riskScore: number;
  pendingDocuments: number;
  verificationLevel: string;
  nextSteps: string[];
}

export default function Verification() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<VerificationStatus>({
    queryKey: ["/api/verification/status"],
  });

  const sendCodeMutation = useMutation({
    mutationFn: async (phone: string) => {
      return apiRequest("/api/verification/phone/send-code", {
        method: "POST",
        body: JSON.stringify({ phoneNumber: phone }),
      });
    },
    onSuccess: () => {
      setShowCodeInput(true);
      toast({
        title: "Verification code sent",
        description: "Check your phone for the 6-digit verification code.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("/api/verification/phone/verify", {
        method: "POST",
        body: JSON.stringify({ verificationCode: code }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification/status"] });
      setShowCodeInput(false);
      setVerificationCode("");
      toast({
        title: "Phone verified successfully",
        description: "Your phone number has been verified. Trust score updated!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }
    sendCodeMutation.mutate(phoneNumber);
  };

  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate(verificationCode);
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case "email": return <Mail className="h-4 w-4" />;
      case "phone": return <Phone className="h-4 w-4" />;
      case "identity": return <FileCheck className="h-4 w-4" />;
      case "full": return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVerificationColor = (level: string) => {
    switch (level) {
      case "none": return "destructive";
      case "email": return "secondary";
      case "phone": return "default";
      case "identity": return "outline";
      case "full": return "default";
      default: return "secondary";
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Loading Verification Status...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Account Verification</h1>
        <p className="text-gray-600">
          Verify your account to build trust with the TaskParent community
        </p>
      </div>

      {/* Current Status Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Verification Status</h2>
          </div>
          <Badge variant={getVerificationColor(status?.verificationLevel || "none")}>
            {getVerificationIcon(status?.verificationLevel || "none")}
            <span className="ml-1 capitalize">{status?.verificationLevel || "None"}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trust Score */}
          <div className="space-y-2">
            <h3 className="font-medium">Trust Score</h3>
            <div className="flex items-center space-x-3">
              <div className={`text-2xl font-bold ${getTrustScoreColor(status?.trustScore || 0)}`}>
                {status?.trustScore || 0}/100
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${status?.trustScore || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div className="space-y-2">
            <h3 className="font-medium">Risk Score</h3>
            <div className="flex items-center space-x-3">
              <div className={`text-2xl font-bold ${status?.riskScore && status.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                {status?.riskScore || 0}/100
              </div>
              <div className="text-sm text-gray-600">
                {status?.riskScore === 0 ? "Low Risk" : 
                 status?.riskScore && status.riskScore < 25 ? "Low Risk" :
                 status?.riskScore && status.riskScore < 50 ? "Medium Risk" : "High Risk"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Verification Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Verification */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5" />
              <h3 className="font-semibold">Email Verification</h3>
            </div>
            {status?.emailVerified ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Verify your email address to secure your account
          </p>
          {status?.emailVerified ? (
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Check your email
            </Badge>
          )}
        </Card>

        {/* Phone Verification */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5" />
              <h3 className="font-semibold">Phone Verification</h3>
            </div>
            {status?.phoneVerified ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Verify your phone number to participate in tasks
          </p>
          {status?.phoneVerified ? (
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <div className="space-y-3">
              {!showCodeInput ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter phone number (e.g., 555-123-4567)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                  />
                  <Button 
                    onClick={handleSendCode}
                    disabled={sendCodeMutation.isPending}
                    className="w-full"
                  >
                    {sendCodeMutation.isPending ? "Sending..." : "Send Verification Code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleVerifyCode}
                    disabled={verifyCodeMutation.isPending}
                    className="w-full"
                  >
                    {verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Identity Verification */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileCheck className="h-5 w-5" />
              <h3 className="font-semibold">Identity Verification</h3>
            </div>
            {status?.identityVerified ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload government ID to create tasks and build trust
          </p>
          {status?.identityVerified ? (
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Requires phone verification first
              </Badge>
              <Button 
                disabled={!status?.phoneVerified}
                className="w-full"
                variant="outline"
              >
                Upload ID Documents
              </Button>
            </div>
          )}
        </Card>

        {/* Background Check */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5" />
              <h3 className="font-semibold">Background Check</h3>
            </div>
            {status?.backgroundChecked ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Complete background screening for high-value tasks
          </p>
          {status?.backgroundChecked ? (
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Requires identity verification first
              </Badge>
              <Button 
                disabled={!status?.identityVerified}
                className="w-full"
                variant="outline"
              >
                Start Background Check
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Next Steps */}
      {status?.nextSteps && status.nextSteps.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Next Steps</h3>
          <ul className="space-y-2">
            {status.nextSteps.map((step, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Benefits of Verification */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Benefits of Full Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Increased Earnings</h4>
            <p className="text-sm text-gray-600">Access to higher-paying tasks and premium opportunities</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Community Trust</h4>
            <p className="text-sm text-gray-600">Higher trust score attracts more task participants</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Platform Safety</h4>
            <p className="text-sm text-gray-600">Help maintain a safe environment for all parents</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Priority Support</h4>
            <p className="text-sm text-gray-600">Faster response times for verified members</p>
          </div>
        </div>
      </Card>
    </div>
  );
}