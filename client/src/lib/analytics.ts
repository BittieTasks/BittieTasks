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
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);

  console.log('✓ Google Analytics initialized successfully');
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
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
};

// Track BittieTasks specific events
export const trackTaskCreated = (taskType: string, amount: number) => {
  trackEvent('task_created', 'tasks', taskType, amount);
};

export const trackTaskCompleted = (taskType: string, earnings: number) => {
  trackEvent('task_completed', 'tasks', taskType, earnings);
};

export const trackPaymentMade = (amount: number, method: string) => {
  trackEvent('payment_made', 'payments', method, amount);
};

export const trackUserSignup = () => {
  trackEvent('sign_up', 'users');
};

export const trackSubscriptionUpgrade = (planName: string) => {
  trackEvent('subscription_upgrade', 'subscriptions', planName);
};

// Track business metrics
export const trackBusinessMetric = (metric: string, value: number, category?: string) => {
  trackEvent('business_metric', category || 'metrics', metric, value);
};

// Track conversions
export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', 'conversions', conversionType, value);
};

// Track file uploads
export const trackFileUpload = (fileType: string, fileSize?: number) => {
  trackEvent('file_upload', 'files', fileType, fileSize);
};

// Track task events
export const trackTaskEvent = (action: string, taskId: string, category?: string, value?: number) => {
  trackEvent(`task_${action}`, 'tasks', `${category || 'general'}_${taskId}`, value);
};

// Track user engagement
export const trackUserEngagement = (action: string, details?: string, value?: number) => {
  trackEvent(`user_${action}`, 'engagement', details, value);
};

// Track payment events
export const trackPaymentEvent = (action: string, amount: number, method?: string) => {
  trackEvent(`payment_${action}`, 'payments', method, amount);
};

// Track search events
export const trackSearch = (query: string, resultsCount?: number) => {
  trackEvent('search', 'search', query, resultsCount);
};