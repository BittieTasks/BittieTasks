import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Users, DollarSign } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/admin", {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the TaskParent platform dashboard.",
      });
      // Reload to refresh authentication state
      window.location.href = "/admin";
    },
    onError: (error: Error) => {
      toast({
        title: "Admin Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const demoLoginMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/demo", {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      toast({
        title: "Demo Access Granted",
        description: "Exploring TaskParent as a demo user.",
      });
      // Reload to refresh authentication state
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Demo Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAdminLogin = () => {
    setIsLoading(true);
    adminLoginMutation.mutate();
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    demoLoginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">TaskParent Access</h1>
          <p className="text-gray-600">Choose your access level to explore the platform</p>
        </div>

        {/* Admin Access Card */}
        <Card className="border-2 border-blue-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Platform Administrator</span>
            </CardTitle>
            <CardDescription>
              Full platform management access with revenue analytics, user management, and security controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <Users className="h-4 w-4 mx-auto text-blue-600" />
                <div className="text-xs text-gray-600">User Management</div>
              </div>
              <div className="space-y-1">
                <DollarSign className="h-4 w-4 mx-auto text-green-600" />
                <div className="text-xs text-gray-600">Revenue Analytics</div>
              </div>
              <div className="space-y-1">
                <Shield className="h-4 w-4 mx-auto text-red-600" />
                <div className="text-xs text-gray-600">Security Controls</div>
              </div>
            </div>
            <Button
              onClick={handleAdminLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {adminLoginMutation.isPending ? "Accessing Admin Panel..." : "Access Admin Dashboard"}
            </Button>
          </CardContent>
        </Card>

        {/* Demo Access Card */}
        <Card className="border-2 border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span>Demo User</span>
            </CardTitle>
            <CardDescription>
              Explore TaskParent features as a regular parent user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDemoLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {demoLoginMutation.isPending ? "Starting Demo..." : "Try Demo Mode"}
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