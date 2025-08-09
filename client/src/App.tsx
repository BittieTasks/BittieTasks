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
import VerifyEmailPage from "@/pages/verify-email-page";
import ResendVerificationPage from "@/pages/resend-verification-page";
import PaymentMethods from "@/pages/payment-methods";
import Partners from "@/pages/partners";
import RevenueDashboard from "@/pages/revenue-dashboard";
import TaskMarketplace from "@/pages/TaskMarketplace";
import EarningsDashboard from "@/pages/EarningsDashboard";
import PaymentFlow from "@/pages/PaymentFlow";
import CorporateSponsorship from "@/pages/CorporateSponsorship";
import type { User } from "@shared/schema";
import { initGA } from "./lib/simpleAnalytics";
import { useSimpleAnalytics as useAnalytics } from "./hooks/use-simple-analytics";
import { SimpleAnalyticsProvider } from "./components/SimpleAnalyticsProvider";
import { useSimpleAuth } from "./hooks/useSimpleAuth";
import { useEffect } from "react";

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useSimpleAuth();

  if (loading) {
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

  if (!user) {
    return <Auth />;
  }

  return <Component />;
}

function SmartLanding() {
  const { user, loading } = useSimpleAuth();

  console.log('SmartLanding render - Loading:', loading, 'User:', user ? user.email : 'none');

  // Show loading while checking auth
  if (loading) {
    console.log('SmartLanding: Showing loading state');
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

  // If authenticated, show home page
  if (user) {
    console.log('SmartLanding: User authenticated, showing Home');
    return <Home />;
  }

  // If not authenticated, show landing page
  console.log('SmartLanding: No user, showing Landing');
  return <Landing />;
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
          {/* Public routes - no authentication required */}
          <Route path="/auth" component={Auth} />
          <Route path="/landing" component={Landing} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/verify-email" component={VerifyEmailPage} />
          <Route path="/resend-verification" component={ResendVerificationPage} />
          <Route path="/admin-login" component={AdminLogin} />
          
          {/* Smart home route - shows Landing for unauth, Home for auth */}
          <Route path="/" component={SmartLanding} />
          <Route path="/home" component={() => <AuthenticatedRoute component={Home} />} />
          <Route path="/task/:id" component={() => <AuthenticatedRoute component={TaskDetail} />} />
          <Route path="/create-task" component={() => <AuthenticatedRoute component={CreateTask} />} />
          <Route path="/earnings" component={() => <AuthenticatedRoute component={Earnings} />} />
          <Route path="/profile" component={() => <AuthenticatedRoute component={Profile} />} />
          <Route path="/messages" component={() => <AuthenticatedRoute component={Messages} />} />
          <Route path="/search" component={() => <AuthenticatedRoute component={Search} />} />
          <Route path="/achievements" component={() => <AuthenticatedRoute component={Achievements} />} />
          <Route path="/challenges" component={() => <AuthenticatedRoute component={DailyChallenges} />} />
          <Route path="/compliance" component={() => <AuthenticatedRoute component={Compliance} />} />
          <Route path="/admin-access" component={() => <AuthenticatedRoute component={AdminAccess} />} />
          <Route path="/admin" component={() => <AuthenticatedRoute component={Admin} />} />
          <Route path="/subscription" component={() => <AuthenticatedRoute component={SubscriptionPage} />} />
          <Route path="/subscription/checkout/:tier" component={() => <AuthenticatedRoute component={SubscriptionCheckout} />} />
          <Route path="/subscription-upgrade" component={() => <AuthenticatedRoute component={SubscriptionUpgrade} />} />
          <Route path="/system-status" component={() => <AuthenticatedRoute component={SystemStatus} />} />
          <Route path="/analytics" component={() => <AuthenticatedRoute component={AnalyticsDashboard} />} />
          <Route path="/payment/:id" component={() => <AuthenticatedRoute component={Payment} />} />
          <Route path="/checkout" component={() => <AuthenticatedRoute component={Checkout} />} />
          <Route path="/payment/success" component={() => <AuthenticatedRoute component={PaymentSuccess} />} />
          <Route path="/payment/error" component={() => <AuthenticatedRoute component={PaymentError} />} />
          <Route path="/referrals" component={() => <AuthenticatedRoute component={ReferralsPage} />} />
          <Route path="/barter" component={() => <AuthenticatedRoute component={Barter} />} />
          <Route path="/partners" component={() => <AuthenticatedRoute component={Partners} />} />
          <Route path="/revenue" component={() => <AuthenticatedRoute component={RevenueDashboard} />} />
          <Route path="/company-application" component={() => <AuthenticatedRoute component={CompanyApplication} />} />
          <Route path="/ethical-partnerships" component={() => <AuthenticatedRoute component={EthicalPartnerships} />} />
          <Route path="/advertising-portal" component={() => <AuthenticatedRoute component={AdvertisingPortal} />} />
          <Route path="/ad-preferences" component={() => <AuthenticatedRoute component={AdPreferences} />} />
          <Route path="/ai-tasks" component={() => <AuthenticatedRoute component={AITaskGeneratorPage} />} />
          <Route path="/payment-methods" component={() => <AuthenticatedRoute component={PaymentMethods} />} />
          <Route path="/marketplace" component={() => <AuthenticatedRoute component={TaskMarketplace} />} />
          <Route path="/dashboard" component={() => <AuthenticatedRoute component={EarningsDashboard} />} />
          <Route path="/payment/:taskId" component={() => <AuthenticatedRoute component={PaymentFlow} />} />
          <Route path="/sponsorship" component={() => <AuthenticatedRoute component={CorporateSponsorship} />} />
          
          {/* Fallback route */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  console.log('🎯 App render');
  
  // Initialize Google Analytics when app loads
  useEffect(() => {
    console.log('🚀 App mounting...');
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAnalyticsProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </SimpleAnalyticsProvider>
    </QueryClientProvider>
  );
}

export default App;
