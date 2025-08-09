import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { focusManagement, KEYBOARD_KEYS, announceToScreenReader } from '@/lib/accessibility';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  finalFocusRef?: React.RefObject<HTMLElement>;
  announceOpen?: boolean;
  announceClose?: boolean;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnEscape = true,
  closeOnOverlayClick = true,
  initialFocusRef,
  finalFocusRef,
  announceOpen = true,
  announceClose = true,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const cleanupFocusTrapRef = React.useRef<(() => void) | null>(null);

  // Handle modal opening
  React.useEffect(() => {
    if (isOpen) {
      // Save previous focus
      previousFocusRef.current = focusManagement.saveFocus();
      
      // Announce modal opening
      if (announceOpen) {
        announceToScreenReader(`Dialog opened: ${title}`, 'assertive');
      }
      
      // Set up focus trap after modal renders
      const timer = setTimeout(() => {
        if (modalRef.current) {
          cleanupFocusTrapRef.current = focusManagement.trapFocus(modalRef.current);
          
          // Focus initial element or first focusable element
          if (initialFocusRef?.current) {
            initialFocusRef.current.focus();
          } else {
            const firstFocusable = modalRef.current.querySelector(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            if (firstFocusable) {
              firstFocusable.focus();
            }
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialFocusRef, title, announceOpen]);

  // Handle modal closing
  React.useEffect(() => {
    if (!isOpen) {
      // Clean up focus trap
      if (cleanupFocusTrapRef.current) {
        cleanupFocusTrapRef.current();
        cleanupFocusTrapRef.current = null;
      }
      
      // Restore previous focus
      if (previousFocusRef.current) {
        const elementToFocus = finalFocusRef?.current || previousFocusRef.current;
        focusManagement.restoreFocus(elementToFocus);
        previousFocusRef.current = null;
      }
      
      // Announce modal closing
      if (announceClose) {
        announceToScreenReader('Dialog closed', 'polite');
      }
    }
  }, [isOpen, finalFocusRef, announceClose]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE && closeOnEscape && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={modalRef}
        className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        onClick={handleOverlayClick}
      >
        <DialogHeader>
          <DialogTitle id="modal-title" className="text-lg font-semibold">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription id="modal-description" className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          {children}
        </div>
        
        {/* Close button for screen readers */}
        <button
          onClick={onClose}
          className="sr-only"
          aria-label="Close dialog"
        >
          Close
        </button>
      </DialogContent>
    </Dialog>
  );
};