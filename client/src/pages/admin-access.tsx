import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Settings, TrendingUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminAccess() {
  const { toast } = useToast();

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
        description: "You now have platform administrator privileges.",
      });
      // Force page reload to update authentication state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Admin Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Admin Access</h1>
          <p className="text-gray-600">Switch to administrator privileges</p>
        </div>

        {/* Admin Features Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Dashboard Features</CardTitle>
            <CardDescription>What you'll have access to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Revenue Analytics</div>
                <div className="text-sm text-gray-600">Platform fees and earnings tracking</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">User Management</div>
                <div className="text-sm text-gray-600">Monitor platform activity and users</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium">Security Controls</div>
                <div className="text-sm text-gray-600">Fraud prevention and safety monitoring</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Login Button */}
        <Button
          onClick={() => adminLoginMutation.mutate()}
          disabled={adminLoginMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        >
          {adminLoginMutation.isPending ? "Switching to Admin..." : "Access Admin Dashboard"}
        </Button>

        {/* Status */}
        <div className="text-center text-sm text-gray-500">
          <p>Secure authentication with session management</p>
        </div>
      </div>
    </div>
  );
}