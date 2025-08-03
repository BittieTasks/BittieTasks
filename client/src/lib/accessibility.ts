// Accessibility utilities and configurations for ADA compliance

export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Main navigation',
  bottomNavigation: 'Bottom navigation',
  breadcrumb: 'Breadcrumb navigation',
  
  // Actions
  login: 'Log in to TaskParent',
  logout: 'Log out of TaskParent',
  submit: 'Submit form',
  cancel: 'Cancel action',
  edit: 'Edit item',
  delete: 'Delete item',
  save: 'Save changes',
  
  // Content
  mainContent: 'Main content',
  sidebar: 'Sidebar content',
  searchResults: 'Search results',
  taskList: 'Available tasks',
  userProfile: 'User profile information',
  
  // Interactive elements
  expandMenu: 'Expand menu',
  collapseMenu: 'Collapse menu',
  openModal: 'Open dialog',
  closeModal: 'Close dialog',
  nextPage: 'Go to next page',
  previousPage: 'Go to previous page',
  
  // Status messages
  loading: 'Loading content',
  error: 'Error message',
  success: 'Success message',
  warning: 'Warning message',
  
  // Form elements
  required: 'Required field',
  optional: 'Optional field',
  passwordToggle: 'Toggle password visibility',
  fileUpload: 'Upload file',
  
  // Task-specific
  taskDetails: 'Task details',
  completeTask: 'Mark task as complete',
  viewTask: 'View task details',
  joinTask: 'Join community task',
  createTask: 'Create new task',
  
  // Wellness/Achievement
  achievementsList: 'Your wellness achievements',
  progressTracker: 'Wellness progress tracker',
  viewAchievement: 'View achievement details'
} as const;

export const ROLES = {
  main: 'main',
  navigation: 'navigation',
  banner: 'banner',
  contentinfo: 'contentinfo',
  complementary: 'complementary',
  search: 'search',
  form: 'form',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  progressbar: 'progressbar',
  tab: 'tab',
  tabpanel: 'tabpanel',
  tablist: 'tablist',
  button: 'button',
  link: 'link'
} as const;

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End'
} as const;

// Focus management utilities
export const focusManagement = {
  // Trap focus within a container (for modals)
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.TAB) {
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
    return () => container.removeEventListener('keydown', handleTabKey);
  },
  
  // Save and restore focus
  saveFocus: () => {
    return document.activeElement as HTMLElement;
  },
  
  restoreFocus: (element: HTMLElement) => {
    if (element && element.focus) {
      element.focus();
    }
  },
  
  // Move focus to element and announce to screen readers
  focusWithAnnouncement: (element: HTMLElement, message?: string) => {
    element.focus();
    if (message) {
      announceToScreenReader(message);
    }
  }
};

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
};

// Color contrast and theme utilities
export const colorContrast = {
  // High contrast mode detection
  isHighContrastMode: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },
  
  // Reduced motion detection
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Color scheme detection
  prefersDarkMode: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
};

// Form validation accessibility
export const formAccessibility = {
  // Generate accessible error messages
  generateErrorId: (fieldName: string) => `${fieldName}-error`,
  generateDescriptionId: (fieldName: string) => `${fieldName}-description`,
  
  // Announce form errors
  announceFormErrors: (errors: Record<string, string>) => {
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      const message = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`;
      announceToScreenReader(message, 'assertive');
    }
  }
};

// Skip link functionality
export const skipLinks = {
  createSkipLink: (targetId: string, text: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    });
    return skipLink;
  }
};

// Loading states with accessibility
export const accessibleLoading = {
  createLoadingMessage: (message: string = 'Loading content') => {
    return {
      'aria-live': 'polite' as const,
      'aria-busy': 'true',
      'aria-label': message,
      role: 'status'
    };
  },
  
  createProgressIndicator: (current: number, max: number, label: string) => {
    return {
      role: 'progressbar' as const,
      'aria-valuenow': current,
      'aria-valuemax': max,
      'aria-valuemin': 0,
      'aria-label': label
    };
  }
};