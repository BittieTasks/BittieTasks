import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient-minimal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import MinimalLanding from "@/pages/minimal-landing";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function App() {
  console.log('🎯 Minimal App render');
  
  useEffect(() => {
    console.log('🚀 Minimal App mounting...');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div>
          <main role="main" id="main-content">
            <Switch>
              <Route path="/auth" component={Auth} />
              <Route path="/" component={MinimalLanding} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;