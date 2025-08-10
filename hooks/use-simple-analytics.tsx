import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/lib/simpleAnalytics';

export const useSimpleAnalytics = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    trackPageView(location);
  }, [location]);
};