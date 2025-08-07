import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function QuickAdmin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/admin", {});
    },
    onSuccess: () => {
      toast({
        title: "Admin Access Granted",
        description: "Redirecting to admin dashboard...",
      });
      setTimeout(() => {
        setLocation("/admin");
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Access Error",
        description: error.message || "Admin login failed",
        variant: "destructive",
      });
    },
  });

  // Auto-grant admin access when page loads
  useEffect(() => {
    adminLoginMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Quick Admin Access</CardTitle>
          <CardDescription>
            Automatic admin dashboard access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminLoginMutation.isPending && (
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600">Setting up admin access...</p>
            </div>
          )}
          
          {adminLoginMutation.isSuccess && (
            <div className="text-center text-green-600">
              <p className="font-medium">Admin access granted!</p>
              <p className="text-sm">Redirecting to dashboard...</p>
            </div>
          )}

          {adminLoginMutation.isError && (
            <div className="space-y-3">
              <p className="text-red-600 text-center text-sm">
                Admin authentication required
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Home & Login
              </Button>
            </div>
          )}
          
          <div className="pt-4 border-t space-y-2">
            <Button 
              onClick={() => setLocation("/admin")}
              variant="outline"
              className="w-full"
            >
              Direct to Admin Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}