import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import TaskDetail from "@/pages/task-detail";
import CreateTask from "@/pages/create-task";
import Earnings from "@/pages/earnings";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import Search from "@/pages/search";
import HowItWorks from "@/pages/how-it-works";
import Auth from "@/pages/auth";
import Achievements from "@/pages/achievements";
import Compliance from "@/pages/Compliance";
import DailyChallenges from "@/pages/DailyChallenges";
import AdminDashboard from "@/pages/admin-simple";
import Verification from "@/pages/verification";
import SecurityDemo from "@/pages/security-demo";
import AdminLogin from "@/pages/admin-login";
import AdminAccess from "@/pages/admin-access";
import QuickAdmin from "@/pages/quick-admin";
import SimpleAdmin from "@/pages/simple-admin";
import type { User } from "@shared/schema";

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/current"],
    retry: false
  });

  if (isLoading) {
    return (
      <div 
        className="max-w-md mx-auto bg-white shadow-xl min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading TaskParent application"
      >
        <div 
          className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          aria-hidden="true"
        />
        <span className="sr-only">Loading application, please wait...</span>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <Component />;
}

function Router() {
  return (
    <div>
      {/* Skip links for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#bottom-navigation" className="skip-link">
        Skip to navigation
      </a>
      
      <main role="main" id="main-content">
        <Switch>
          <Route path="/" component={() => <AuthenticatedRoute component={Home} />} />
          <Route path="/auth" component={Auth} />
          <Route path="/task/:id" component={() => <AuthenticatedRoute component={TaskDetail} />} />
          <Route path="/create-task" component={() => <AuthenticatedRoute component={CreateTask} />} />
          <Route path="/earnings" component={() => <AuthenticatedRoute component={Earnings} />} />
          <Route path="/profile" component={() => <AuthenticatedRoute component={Profile} />} />
          <Route path="/messages" component={() => <AuthenticatedRoute component={Messages} />} />
          <Route path="/search" component={() => <AuthenticatedRoute component={Search} />} />
          <Route path="/achievements" component={() => <AuthenticatedRoute component={Achievements} />} />
          <Route path="/challenges" component={() => <AuthenticatedRoute component={DailyChallenges} />} />
          <Route path="/compliance" component={() => <AuthenticatedRoute component={Compliance} />} />
          <Route path="/verification" component={() => <AuthenticatedRoute component={Verification} />} />
          <Route path="/security-demo" component={() => <AuthenticatedRoute component={SecurityDemo} />} />
          <Route path="/admin" component={() => <AuthenticatedRoute component={AdminDashboard} />} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin-access" component={() => <AuthenticatedRoute component={AdminAccess} />} />
          <Route path="/quick-admin" component={QuickAdmin} />
          <Route path="/simple-admin" component={SimpleAdmin} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
