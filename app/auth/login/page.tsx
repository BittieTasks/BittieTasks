import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Server-side redirect to /auth with query parameters preserved
  const resolvedParams = await searchParams
  const params = new URLSearchParams()
  
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, Array.isArray(value) ? value.join(',') : value)
    }
  })
  
  const redirectUrl = params.toString() ? `/auth?${params.toString()}` : '/auth'
  redirect(redirectUrl)
}