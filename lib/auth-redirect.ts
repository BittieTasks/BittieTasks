// Helper functions for managing authentication redirects

export function setIntendedUrl(url: string) {
  if (typeof document !== 'undefined') {
    // Set cookie that will persist across authentication flow
    document.cookie = `intended_url=${encodeURIComponent(url)}; path=/; max-age=3600; SameSite=Lax`
  }
}

export function getIntendedUrl(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'intended_url') {
      return decodeURIComponent(value)
    }
  }
  return null
}

export function clearIntendedUrl() {
  if (typeof document !== 'undefined') {
    document.cookie = 'intended_url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export function redirectToAuthWithIntent(currentPath: string) {
  setIntendedUrl(currentPath)
  window.location.href = '/auth'
}