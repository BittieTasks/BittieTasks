import { useEffect, useState } from 'react';
import { colorContrast, announceToScreenReader } from '@/lib/accessibility';

// Hook for detecting user accessibility preferences
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: colorContrast.prefersReducedMotion(),
        prefersHighContrast: colorContrast.isHighContrastMode(),
        prefersDarkMode: colorContrast.prefersDarkMode()
      });
    };

    // Initial check
    updatePreferences();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)')
    ];

    const handleChange = () => updatePreferences();
    
    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleChange);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleChange);
      });
    };
  }, []);

  return preferences;
};

// Hook for managing focus and keyboard navigation
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const saveFocus = () => {
    setFocusedElement(document.activeElement as HTMLElement);
  };

  const restoreFocus = () => {
    if (focusedElement && focusedElement.focus) {
      focusedElement.focus();
      setFocusedElement(null);
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
    focusedElement
  };
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  };

  const announceNavigation = (pageName: string) => {
    announce(`Navigated to ${pageName}`, 'polite');
  };

  const announceError = (error: string) => {
    announce(`Error: ${error}`, 'assertive');
  };

  const announceSuccess = (message: string) => {
    announce(`Success: ${message}`, 'polite');
  };

  return {
    announce,
    announceNavigation,
    announceError,
    announceSuccess
  };
};

// Hook for managing loading states accessibly
export const useAccessibleLoading = (isLoading: boolean, loadingMessage?: string) => {
  const { announce } = useScreenReader();

  useEffect(() => {
    if (isLoading && loadingMessage) {
      announce(loadingMessage, 'polite');
    }
  }, [isLoading, loadingMessage, announce]);

  return {
    loadingProps: {
      'aria-busy': isLoading,
      'aria-live': 'polite' as const,
      role: 'status' as const
    }
  };
};

// Hook for form accessibility
export const useAccessibleForm = () => {
  const { announceError } = useScreenReader();

  const announceFormErrors = (errors: Record<string, string>) => {
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      const message = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`;
      announceError(message);
    }
  };

  const generateFieldIds = (fieldName: string) => ({
    fieldId: fieldName,
    errorId: `${fieldName}-error`,
    descriptionId: `${fieldName}-description`
  });

  return {
    announceFormErrors,
    generateFieldIds
  };
};