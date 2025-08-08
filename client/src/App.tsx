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
import AdminLogin from "@/pages/admin-login";
import AdminAccess from "@/pages/admin-access";
import Admin from "@/pages/admin";
import SubscriptionPage from "@/pages/subscription";
import SubscriptionCheckout from "@/pages/subscription-checkout";
import SubscriptionUpgrade from "@/pages/subscription-upgrade";
import SystemStatus from "@/pages/system-status";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import Payment from "@/pages/payment";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import PaymentError from "@/pages/payment-error";
import ReferralsPage from "@/pages/referrals";
import Barter from "@/pages/barter";
import CompanyApplication from "@/pages/company-application";
import EthicalPartnerships from "@/pages/ethical-partnerships";
import AdvertisingPortal from "@/pages/advertising-portal";
import AdPreferences from "@/pages/ad-preferences";
import AITaskGeneratorPage from "@/pages/ai-task-generator";
import VerifyEmailPage from "@/pages/verify-email";
import ResendVerificationPage from "@/pages/resend-verification";
import PaymentMethods from "@/pages/payment-methods";
import Partners from "@/pages/partners";
import RevenueDashboard from "@/pages/revenue-dashboard";
import type { User } from "@shared/schema";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div 
        className="max-w-md mx-auto bg-white shadow-xl min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading BittieTasks application"
      >
        <div 
          className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          aria-hidden="true"
        />
        <span className="sr-only">Loading application, please wait...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <Component />;
}

function Router() {
  // Track page views when routes change
  useAnalytics();
  
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
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin-access" component={() => <AuthenticatedRoute component={AdminAccess} />} />
          <Route path="/admin" component={() => <AuthenticatedRoute component={Admin} />} />
          <Route path="/subscription" component={() => <AuthenticatedRoute component={SubscriptionPage} />} />
          <Route path="/subscription/checkout/:tier" component={() => <AuthenticatedRoute component={SubscriptionCheckout} />} />
          <Route path="/subscription-upgrade" component={() => <AuthenticatedRoute component={SubscriptionUpgrade} />} />
          <Route path="/system-status" component={() => <AuthenticatedRoute component={SystemStatus} />} />
          <Route path="/analytics" component={() => <AuthenticatedRoute component={AnalyticsDashboard} />} />
          <Route path="/payment/:id" component={() => <AuthenticatedRoute component={Payment} />} />
          <Route path="/checkout" component={() => <AuthenticatedRoute component={Checkout} />} />
          <Route path="/payment/success" component={PaymentSuccess} />
          <Route path="/payment/error" component={PaymentError} />
          <Route path="/referrals" component={() => <AuthenticatedRoute component={ReferralsPage} />} />
          <Route path="/barter" component={() => <AuthenticatedRoute component={Barter} />} />
          <Route path="/partners" component={Partners} />
          <Route path="/revenue" component={() => <AuthenticatedRoute component={RevenueDashboard} />} />
          <Route path="/company-application" component={CompanyApplication} />
          <Route path="/ethical-partnerships" component={EthicalPartnerships} />
          <Route path="/advertising-portal" component={AdvertisingPortal} />
          <Route path="/ad-preferences" component={() => <AuthenticatedRoute component={AdPreferences} />} />
          <Route path="/ai-tasks" component={AITaskGeneratorPage} />
          <Route path="/verify-email" component={VerifyEmailPage} />
          <Route path="/resend-verification" component={ResendVerificationPage} />
          <Route path="/payment-methods" component={() => <AuthenticatedRoute component={PaymentMethods} />} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AnalyticsProvider>
    </QueryClientProvider>
  );
}

export default App;
