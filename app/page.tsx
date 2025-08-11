import SafeWelcomePage from '@/components/SafeWelcomePage'

export default function HomePage() {
  // Simplified homepage - no complex auth logic that could cause hydration issues
  return <SafeWelcomePage />
}