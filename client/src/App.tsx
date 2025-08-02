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
import type { User } from "@shared/schema";

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/current"],
    retry: false
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
      <Route path="/compliance" component={() => <AuthenticatedRoute component={Compliance} />} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route component={NotFound} />
    </Switch>
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
