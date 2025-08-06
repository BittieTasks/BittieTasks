import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, User, Users, DollarSign, Mail, Key } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [requiresCode, setRequiresCode] = useState(false);

  const adminLoginMutation = useMutation({
    mutationFn: async (data: { email?: string; verificationCode?: string }) => {
      const response = await apiRequest("POST", "/api/auth/admin", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the BittieTasks platform dashboard.",
      });
      // Force reload to refresh authentication state and redirect
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    },
    onError: (error: any) => {
      if (error.message.includes("Verification code required")) {
        setRequiresCode(true);
        toast({
          title: "Verification Required",
          description: "Please enter the admin verification code.",
        });
      } else {
        toast({
          title: "Admin Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
      setIsLoading(false);
    },
  });

  const handleQuickAccess = () => {
    setIsLoading(true);
    adminLoginMutation.mutate({});
  };

  const handleEmailLogin = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your admin email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (requiresCode && !verificationCode) {
      toast({
        title: "Verification Code Required",
        description: "Please enter the admin verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    adminLoginMutation.mutate({ email, verificationCode });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BittieTasks Admin</h1>
          <p className="text-gray-600">Secure administrator access with Stripe integration</p>
        </div>

        {/* Email-Based Admin Login */}
        <Card className="border-2 border-blue-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span>Email Authentication</span>
            </CardTitle>
            <CardDescription>
              Login with your authorized admin email for full platform access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            {requiresCode && (
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="admin2025"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Use code: admin2025</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3 text-center py-2">
              <div className="space-y-1">
                <Users className="h-4 w-4 mx-auto text-blue-600" />
                <div className="text-xs text-gray-600">User Management</div>
              </div>
              <div className="space-y-1">
                <DollarSign className="h-4 w-4 mx-auto text-green-600" />
                <div className="text-xs text-gray-600">Stripe Analytics</div>
              </div>
              <div className="space-y-1">
                <Shield className="h-4 w-4 mx-auto text-red-600" />
                <div className="text-xs text-gray-600">Security Controls</div>
              </div>
            </div>
            
            <Button
              onClick={handleEmailLogin}
              disabled={isLoading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {adminLoginMutation.isPending ? "Verifying Access..." : "Login as Admin"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Access Card */}
        <Card className="border-2 border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-gray-600" />
              <span>Quick Access</span>
            </CardTitle>
            <CardDescription>
              One-click admin access for development and testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleQuickAccess}
              disabled={isLoading}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              {adminLoginMutation.isPending ? "Accessing..." : "Quick Admin Access"}
            </Button>
          </CardContent>
        </Card>



        {/* Platform Info */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>TaskParent Platform Management</p>
          <p>Secure authentication with session management</p>
        </div>
      </div>
    </div>
  );
}