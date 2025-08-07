import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView, trackEvent } from '../lib/analytics';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  const sessionStartRef = useRef<Date>(new Date());
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Track page view
      trackPageView(location, document.title);
      
      // Track navigation event
      trackEvent('page_navigation', 'Navigation', location);
      
      prevLocationRef.current = location;
    }
  }, [location]);

  // Track session duration on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStartRef.current.getTime();
      trackEvent('session_duration', 'Engagement', 'session_end', Math.round(sessionDuration / 1000));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Return analytics helpers for components to use
  return {
    trackEvent,
    trackPageView,
    currentLocation: location
  };
};