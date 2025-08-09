// Screen reader announcements
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.style.position = 'absolute'
  announcement.style.left = '-10000px'
  announcement.style.width = '1px'
  announcement.style.height = '1px'
  announcement.style.overflow = 'hidden'
  
  document.body.appendChild(announcement)
  announcement.textContent = message
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// ARIA labels for common interface elements
export const ARIA_LABELS = {
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    tabs: 'Tab navigation',
  },
  actions: {
    close: 'Close dialog',
    expand: 'Expand section',
    collapse: 'Collapse section',
    edit: 'Edit item',
    delete: 'Delete item',
    save: 'Save changes',
    cancel: 'Cancel action',
    submit: 'Submit form',
    search: 'Search',
    filter: 'Filter results',
    sort: 'Sort options',
  },
  status: {
    loading: 'Loading content',
    error: 'Error occurred',
    success: 'Action completed successfully',
    required: 'Required field',
    optional: 'Optional field',
  },
  content: {
    skipToMain: 'Skip to main content',
    menu: 'Menu',
    profile: 'User profile',
    notifications: 'Notifications',
    settings: 'Settings',
  },
} as const

// Form accessibility helpers
export const formAccessibility = {
  getFieldId: (name: string) => `field-${name}`,
  getErrorId: (name: string) => `error-${name}`,
  getHelpId: (name: string) => `help-${name}`,
}

// Focus management utilities
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

// Keyboard navigation helpers
export const handleArrowNavigation = (
  items: NodeListOf<HTMLElement>,
  currentIndex: number,
  direction: 'up' | 'down' | 'left' | 'right'
): number => {
  let newIndex = currentIndex

  switch (direction) {
    case 'up':
    case 'left':
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      break
    case 'down':
    case 'right':
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      break
  }

  items[newIndex]?.focus()
  return newIndex
}