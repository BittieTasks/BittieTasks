import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TaskDetail from "@/pages/task-detail";
import Earnings from "@/pages/earnings";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import Search from "@/pages/search";
import HowItWorks from "@/pages/how-it-works";
import Auth from "@/pages/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/task/:id" component={TaskDetail} />
      <Route path="/earnings" component={Earnings} />
      <Route path="/profile" component={Profile} />
      <Route path="/messages" component={Messages} />
      <Route path="/search" component={Search} />
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
