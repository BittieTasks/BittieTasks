import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { ARIA_LABELS, announceToScreenReader } from '@/lib/accessibility';

interface AccessibleButtonProps extends ButtonProps {
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  
  // Enhanced button states
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  
  // Announce success/error to screen readers
  announceStateChange?: boolean;
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    ariaLabel,
    ariaDescribedBy,
    loadingText = 'Loading...',
    successText = 'Success',
    errorText = 'Error occurred',
    isLoading = false,
    isSuccess = false,
    isError = false,
    announceStateChange = true,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const prevLoadingRef = React.useRef(isLoading);
    const prevSuccessRef = React.useRef(isSuccess);
    const prevErrorRef = React.useRef(isError);

    // Announce state changes to screen readers
    React.useEffect(() => {
      if (announceStateChange) {
        if (isLoading && !prevLoadingRef.current) {
          announceToScreenReader(loadingText);
        } else if (isSuccess && !prevSuccessRef.current) {
          announceToScreenReader(successText);
        } else if (isError && !prevErrorRef.current) {
          announceToScreenReader(errorText);
        }
      }
      
      prevLoadingRef.current = isLoading;
      prevSuccessRef.current = isSuccess;
      prevErrorRef.current = isError;
    }, [isLoading, isSuccess, isError, announceStateChange, loadingText, successText, errorText]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Ensure button responds to Enter and Space keys
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isLoading && !disabled && onClick) {
          onClick(e as any);
        }
      }
    };

    const buttonText = React.useMemo(() => {
      if (isLoading) return loadingText;
      if (isSuccess) return successText;
      if (isError) return errorText;
      return children;
    }, [isLoading, isSuccess, isError, loadingText, successText, errorText, children]);

    return (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={isLoading}
        aria-live={isLoading || isSuccess || isError ? 'polite' : undefined}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {isLoading && (
          <>
            <div 
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
              aria-hidden="true"
            />
            <span className="sr-only">Loading</span>
          </>
        )}
        {isSuccess && (
          <span className="mr-2" aria-hidden="true">✓</span>
        )}
        {isError && (
          <span className="mr-2" aria-hidden="true">⚠</span>
        )}
        {buttonText}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';