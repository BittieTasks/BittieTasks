import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ReferralSignupProps {
  onReferralValidated?: (referralData: any) => void;
}

export default function ReferralSignup({ onReferralValidated }: ReferralSignupProps) {
  const [referralCode, setReferralCode] = useState("");
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [referralData, setReferralData] = useState<any>(null);
  const { toast } = useToast();

  // Check for referral code in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
      validateReferralCode(refCode.toUpperCase());
    }
  }, []);

  const validateReferralCode = async (code: string) => {
    if (!code || code.length < 6) {
      setValidationStatus("idle");
      return;
    }

    setValidationStatus("validating");
    
    try {
      const response = await apiRequest("POST", "/api/referrals/validate", { referralCode: code });
      
      if (response.valid) {
        setValidationStatus("valid");
        setReferralData(response);
        onReferralValidated?.(response);
        toast({
          title: "Valid Referral Code!",
          description: `You'll get $${response.newUserBonus} bonus after your first task`,
        });
      } else {
        setValidationStatus("invalid");
        setReferralData(null);
        toast({
          title: "Invalid Referral Code",
          description: "Please check the code and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      setValidationStatus("invalid");
      setReferralData(null);
      toast({
        title: "Validation Failed",
        description: "Could not validate referral code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setReferralCode(upperValue);
    
    if (upperValue.length >= 6) {
      validateReferralCode(upperValue);
    } else {
      setValidationStatus("idle");
      setReferralData(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-xl">Have a Referral Code?</CardTitle>
        <CardDescription>
          Enter your friend's referral code to get a $5 bonus after your first completed task
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Enter 6-digit code (e.g., ABC123)"
            value={referralCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            maxLength={6}
            className={`text-center text-lg font-mono tracking-wider ${
              validationStatus === "valid" ? "border-green-500 bg-green-50" :
              validationStatus === "invalid" ? "border-red-500 bg-red-50" : ""
            }`}
          />
          
          {validationStatus === "validating" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {validationStatus === "valid" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
          
          {validationStatus === "invalid" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>

        {validationStatus === "valid" && referralData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Valid Code!</span>
              <Badge className="bg-green-500">+${referralData.newUserBonus}</Badge>
            </div>
            <p className="text-sm text-green-700">
              Referred by: <span className="font-medium">{referralData.referrerName}</span>
            </p>
            <p className="text-xs text-green-600 mt-1">
              You'll receive your $5 bonus after completing your first task
            </p>
          </div>
        )}

        {validationStatus === "invalid" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-800">Invalid referral code</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Please check the code and try again, or continue without a referral code
            </p>
          </div>
        )}

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setReferralCode("");
              setValidationStatus("idle");
              setReferralData(null);
            }}
            className="text-gray-500 text-sm"
          >
            Skip referral code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}