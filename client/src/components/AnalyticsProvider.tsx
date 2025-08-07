import React, { createContext, useContext, ReactNode } from 'react';
import { 
  trackEvent, 
  trackTaskEvent, 
  trackUserEngagement, 
  trackPaymentEvent,
  trackSearch,
  trackFileUpload,
  trackConversion,
  trackBusinessMetric
} from '@/lib/analytics';
import { apiRequest } from '@/lib/queryClient';

interface AnalyticsContextType {
  // Core tracking functions
  track: (eventName: string, properties?: Record<string, any>) => void;
  trackTask: (action: 'view' | 'apply' | 'complete' | 'abandon', taskId: string, category?: string, value?: number) => void;
  trackUser: (action: 'signup' | 'login' | 'logout' | 'profile_update' | 'subscription_upgrade', method?: string, tier?: string) => void;
  trackPayment: (action: 'initiated' | 'completed' | 'failed' | 'abandoned', amount: number, method?: 'stripe' | 'paypal', tier?: string) => void;
  trackSearch: (query: string, resultsCount?: number) => void;
  trackFileUpload: (category: 'task_proof' | 'profile_picture' | 'document', fileSize: number) => void;
  trackConversion: (type: 'signup' | 'first_task' | 'first_payment' | 'subscription' | 'referral_success', value?: number, transactionId?: string) => void;
  trackBusiness: (metric: 'earnings_generated' | 'task_completed' | 'referral_made' | 'subscription_renewed', value: number, category?: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // Enhanced tracking that sends to both Google Analytics and our backend
  const track = async (eventName: string, properties: Record<string, any> = {}) => {
    try {
      // Track in Google Analytics
      trackEvent(eventName, properties.category, properties.label, properties.value);
      
      // Track in our analytics service
      await apiRequest('POST', '/api/analytics/track', {
        eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          url: window.location.pathname,
          referrer: document.referrer || undefined
        }
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Still track in GA even if backend fails
      trackEvent(eventName, properties.category, properties.label, properties.value);
    }
  };

  const trackTask = (
    action: 'view' | 'apply' | 'complete' | 'abandon', 
    taskId: string, 
    category?: string, 
    value?: number
  ) => {
    trackTaskEvent(action, taskId, category, value);
    track(`task_${action}`, {
      taskId,
      category,
      value,
      action
    });
  };

  const trackUser = (
    action: 'signup' | 'login' | 'logout' | 'profile_update' | 'subscription_upgrade', 
    method?: string, 
    tier?: string
  ) => {
    trackUserEngagement(action, method);
    track(`user_${action}`, {
      method,
      tier,
      action
    });
  };

  const trackPayment = (
    action: 'initiated' | 'completed' | 'failed' | 'abandoned', 
    amount: number, 
    method: 'stripe' | 'paypal' = 'stripe', 
    tier?: string
  ) => {
    trackPaymentEvent(action, amount, method);
    track(`payment_${action}`, {
      amount,
      method,
      tier,
      action
    });
  };

  const trackSearchAction = (query: string, resultsCount: number = 0) => {
    trackSearch(query, resultsCount);
    track('search_performed', {
      query,
      resultsCount,
      searchType: 'task_search'
    });
  };

  const trackFileUploadAction = (category: 'task_proof' | 'profile_picture' | 'document', fileSize: number) => {
    trackFileUpload(category, fileSize);
    track('file_uploaded', {
      category,
      fileSize: Math.round(fileSize / 1024), // KB
      fileSizeMB: Math.round(fileSize / 1024 / 1024 * 100) / 100 // MB
    });
  };

  const trackConversionAction = (
    type: 'signup' | 'first_task' | 'first_payment' | 'subscription' | 'referral_success', 
    value?: number, 
    transactionId?: string
  ) => {
    trackConversion(type, value);
    track('conversion', {
      conversionType: type,
      value,
      transactionId
    });
  };

  const trackBusinessAction = (
    metric: 'earnings_generated' | 'task_completed' | 'referral_made' | 'subscription_renewed', 
    value: number, 
    category?: string
  ) => {
    trackBusinessMetric(metric, value, category);
    track('business_metric', {
      metric,
      value,
      category
    });
  };

  const contextValue: AnalyticsContextType = {
    track,
    trackTask,
    trackUser,
    trackPayment,
    trackSearch: trackSearchAction,
    trackFileUpload: trackFileUploadAction,
    trackConversion: trackConversionAction,
    trackBusiness: trackBusinessAction
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsTracking = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsTracking must be used within an AnalyticsProvider');
  }
  return context;
};