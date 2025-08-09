import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient-minimal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import MinimalLanding from "@/pages/minimal-landing";
import SimpleAuth from "@/pages/simple-auth";
import SimpleHome from "@/pages/simple-home";
import AuthDebug from "@/pages/auth-debug";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-green-500">
        <div className="text-white text-xl">Loading BittieTasks...</div>
      </div>
    );
  }

  if (!user) {
    return <SimpleAuth />;
  }

  return <Component />;
}

function Router() {
  const { user, loading } = useSupabaseAuth();

  console.log('🔐 Router render - Loading:', loading, 'User:', user ? 'authenticated' : 'not authenticated');

  return (
    <Switch>
      <Route path="/auth" component={SimpleAuth} />
      <Route path="/debug" component={AuthDebug} />
      {!loading && user ? (
        <>
          <Route path="/" component={SimpleHome} />
          <Route path="/home" component={SimpleHome} />
        </>
      ) : (
        <Route path="/" component={MinimalLanding} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  console.log('🎯 Working App render');
  
  useEffect(() => {
    console.log('🚀 Working BittieTasks app with Supabase auth...');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div>
          <main role="main" id="main-content">
            <Router />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;