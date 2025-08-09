import React, { createContext, useContext, ReactNode } from 'react';

interface SimpleAnalyticsContextType {
  track: (eventName: string, properties?: Record<string, any>) => void;
  trackTask: (action: string, taskId: string) => void;
  trackUser: (action: string) => void;
  trackPayment: (action: string, amount: number) => void;
  trackSearch: (query: string) => void;
  trackFileUpload: (category: string, fileSize: number) => void;
  trackConversion: (type: string) => void;
  trackBusiness: (metric: string, value: number) => void;
}

const SimpleAnalyticsContext = createContext<SimpleAnalyticsContextType | undefined>(undefined);

export const SimpleAnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Simple tracking that just logs - prevents errors
  const track = (eventName: string, properties: Record<string, any> = {}) => {
    console.log('📊 Analytics:', eventName, properties);
  };

  const trackTask = (action: string, taskId: string) => {
    console.log('📊 Task:', action, taskId);
  };

  const trackUser = (action: string) => {
    console.log('📊 User:', action);
  };

  const trackPayment = (action: string, amount: number) => {
    console.log('📊 Payment:', action, amount);
  };

  const trackSearch = (query: string) => {
    console.log('📊 Search:', query);
  };

  const trackFileUpload = (category: string, fileSize: number) => {
    console.log('📊 Upload:', category, fileSize);
  };

  const trackConversion = (type: string) => {
    console.log('📊 Conversion:', type);
  };

  const trackBusiness = (metric: string, value: number) => {
    console.log('📊 Business:', metric, value);
  };

  const contextValue: SimpleAnalyticsContextType = {
    track,
    trackTask,
    trackUser,
    trackPayment,
    trackSearch,
    trackFileUpload,
    trackConversion,
    trackBusiness
  };

  return (
    <SimpleAnalyticsContext.Provider value={contextValue}>
      {children}
    </SimpleAnalyticsContext.Provider>
  );
};

export const useSimpleAnalytics = (): SimpleAnalyticsContextType => {
  const context = useContext(SimpleAnalyticsContext);
  if (!context) {
    // Return dummy functions instead of throwing error
    return {
      track: () => {},
      trackTask: () => {},
      trackUser: () => {},
      trackPayment: () => {},
      trackSearch: () => {},
      trackFileUpload: () => {},
      trackConversion: () => {},
      trackBusiness: () => {},
    };
  }
  return context;
};