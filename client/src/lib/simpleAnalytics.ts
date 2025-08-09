// Simple analytics functions that don't make API calls
export const initGA = () => {
  console.log('📊 GA initialized (simple mode)');
};

export const trackPageView = (url: string) => {
  console.log('📊 Page view:', url);
};

export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  console.log('📊 Event:', { action, category, label, value });
};