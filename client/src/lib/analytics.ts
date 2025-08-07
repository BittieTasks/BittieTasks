// Google Analytics 4 Integration for BittieTasks
// Tracks user interactions, conversions, and platform performance

// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_title: document.title,
      page_location: window.location.href
    });
  `;
  document.head.appendChild(script2);

  console.log('✅ Google Analytics initialized');
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url,
    page_title: title || document.title
  });

  console.log(`📊 GA Page View: ${url}`);
};

// Track custom events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  console.log(`📊 GA Event: ${action} | ${category} | ${label}`);
};

// Track task-specific events
export const trackTaskEvent = (
  action: 'view' | 'apply' | 'complete' | 'abandon',
  taskId: string,
  taskCategory?: string,
  taskValue?: number
) => {
  trackEvent(`task_${action}`, 'Tasks', `${taskCategory || 'Unknown'}_${taskId}`, taskValue);
};

// Track user engagement events
export const trackUserEngagement = (
  action: 'signup' | 'login' | 'logout' | 'profile_update' | 'subscription_upgrade',
  method?: string,
  tier?: string
) => {
  const label = method || tier || undefined;
  trackEvent(action, 'User', label);
};

// Track payment events
export const trackPaymentEvent = (
  action: 'initiated' | 'completed' | 'failed' | 'abandoned',
  amount: number,
  method: 'stripe' | 'paypal' = 'stripe',
  subscriptionTier?: string
) => {
  trackEvent(`payment_${action}`, 'Payments', `${method}_${subscriptionTier || 'one_time'}`, amount);
};

// Track search behavior
export const trackSearch = (query: string, resultsCount: number = 0) => {
  trackEvent('search', 'Tasks', query, resultsCount);
};

// Track file uploads
export const trackFileUpload = (category: 'task_proof' | 'profile_picture' | 'document', fileSize: number) => {
  trackEvent('file_upload', 'Files', category, Math.round(fileSize / 1024)); // Size in KB
};

// Track social sharing
export const trackSocialShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email', content: string) => {
  trackEvent('share', 'Social', `${platform}_${content}`);
};

// Track errors and issues
export const trackError = (errorType: string, errorMessage: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
  trackEvent('exception', 'Errors', `${severity}_${errorType}_${errorMessage.substring(0, 100)}`);
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  trackEvent('timing_complete', 'Performance', `${metric}_${unit}`, value);
};

// Track business metrics
export const trackBusinessMetric = (
  metric: 'earnings_generated' | 'task_completed' | 'referral_made' | 'subscription_renewed',
  value: number,
  category?: string
) => {
  trackEvent(metric, 'Business', category, value);
};

// Enhanced conversion tracking
export const trackConversion = (
  conversionType: 'signup' | 'first_task' | 'first_payment' | 'subscription' | 'referral_success',
  value?: number,
  transactionId?: string
) => {
  window.gtag?.('event', 'conversion', {
    send_to: import.meta.env.VITE_GA_MEASUREMENT_ID,
    event_category: 'Conversions',
    event_label: conversionType,
    value: value,
    transaction_id: transactionId
  });

  console.log(`🎯 GA Conversion: ${conversionType} | Value: ${value}`);
};

// Track user properties for better segmentation
export const setUserProperties = (userId: string, properties: {
  subscription_tier?: string;
  user_type?: 'task_creator' | 'task_doer' | 'both';
  location_state?: string;
  signup_method?: string;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    custom_map: {
      custom_parameter_1: 'subscription_tier',
      custom_parameter_2: 'user_type',
      custom_parameter_3: 'location_state'
    },
    user_id: userId,
    ...properties
  });

  console.log(`👤 GA User Properties Set: ${userId}`);
};

// Track enhanced ecommerce events
export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items: Array<{
    item_id: string;
    item_name: string;
    item_category: string;
    quantity: number;
    price: number;
  }>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items
  });

  console.log(`💰 GA Purchase: ${transactionId} | $${value}`);
};