import { useEffect, useRef, useState } from 'react'
import { announceToScreenReader } from '@/lib/accessibility'

// Hook for accessible form management
export const useAccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announceError = (fieldName: string, message: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: message }))
    announceToScreenReader(`Error in ${fieldName}: ${message}`)
  }

  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }

  const announceSuccess = (message: string) => {
    announceToScreenReader(message)
    setAnnouncements(prev => [...prev, message])
  }

  return {
    errors,
    announceError,
    clearError,
    announceSuccess,
    announcements,
  }
}

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message)
  }

  return { announce }
}

// Hook for focus management
export const useFocusManagement = () => {
  const focusElementRef = useRef<HTMLElement | null>(null)

  const setFocusElement = (element: HTMLElement | null) => {
    focusElementRef.current = element
  }

  const focusElement = () => {
    if (focusElementRef.current) {
      focusElementRef.current.focus()
    }
  }

  const moveFocusToElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      setFocusElement(element)
    }
  }

  return {
    setFocusElement,
    focusElement,
    moveFocusToElement,
  }
}

// Hook for keyboard navigation
export const useKeyboardNavigation = (items: HTMLElement[] = []) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (items.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        setCurrentIndex(prev => (prev + 1) % items.length)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        setCurrentIndex(prev => (prev - 1 + items.length) % items.length)
        break
      case 'Home':
        event.preventDefault()
        setCurrentIndex(0)
        break
      case 'End':
        event.preventDefault()
        setCurrentIndex(items.length - 1)
        break
    }
  }

  useEffect(() => {
    if (items[currentIndex]) {
      items[currentIndex].focus()
    }
  }, [currentIndex, items])

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  }
}