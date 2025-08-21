'use client'

import { UnifiedAuth } from './unified-auth'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
}

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = typeof window !== 'undefined' ? window.location.origin : ''
  }

  // Get headers with authentication
  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    try {
      const token = await UnifiedAuth.getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('ApiClient: Unable to get access token:', error)
    }

    return headers
  }

  // Generic API request method
  private async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
      const headers = await this.getHeaders()

      const config: RequestInit = {
        method,
        headers,
      }

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data)
      }

      console.log(`ApiClient: ${method} ${endpoint}`, data ? { hasData: true } : {})

      const response = await fetch(url, config)
      const responseData = await response.json()

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          console.warn('ApiClient: Unauthorized request, clearing session')
          await UnifiedAuth.signOut()
          throw new Error('Authentication required. Please sign in again.')
        }

        throw new Error(responseData.error || responseData.message || `HTTP ${response.status}`)
      }

      return responseData

    } catch (error: any) {
      console.error(`ApiClient: ${method} ${endpoint} failed:`, error.message)
      throw error
    }
  }

  // HTTP method helpers
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint)
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data)
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data)
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, data)
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint)
  }

  // Authentication specific methods
  async signIn(email: string, password: string) {
    return this.post('/api/auth/signin', { email, password })
  }

  async signUp(email: string, password: string, userData?: any) {
    return this.post('/api/auth/signup', {
      email,
      password,
      ...userData
    })
  }

  async getCurrentUser() {
    return this.get('/api/auth/user')
  }

  async getUserProfile() {
    return this.get('/api/auth/profile')
  }

  // Task related methods
  async getTasks(type?: string) {
    const endpoint = type ? `/api/tasks?type=${type}` : '/api/tasks'
    return this.get(endpoint)
  }

  async getTask(id: string) {
    return this.get(`/api/tasks/${id}`)
  }

  async createTask(taskData: any) {
    return this.post('/api/tasks', taskData)
  }

  async applyToTask(taskId: string, applicationData: any) {
    return this.post(`/api/tasks/${taskId}/apply`, applicationData)
  }

  async submitTaskVerification(taskId: string, verificationData: any) {
    return this.post('/api/tasks/verification', {
      taskId,
      ...verificationData
    })
  }

  // Payment methods
  async createPaymentIntent(amount: number, taskId?: string) {
    return this.post('/api/payments/create-intent', { amount, taskId })
  }

  async createSubscription(priceId: string) {
    return this.post('/api/stripe/create-subscription', { priceId })
  }

  async getSubscriptionStatus() {
    return this.get('/api/stripe/subscription-status')
  }

  // Dashboard and earnings
  async getDashboardData() {
    return this.get('/api/dashboard')
  }

  async getEarnings() {
    return this.get('/api/earnings')
  }

  // Solo tasks
  async getSoloTasks() {
    return this.get('/api/solo-tasks')
  }

  async startSoloTask(taskId: string) {
    return this.post(`/api/solo-tasks/${taskId}/start`)
  }

  async submitSoloTaskVerification(taskId: string, verificationData: any) {
    return this.post('/api/solo-tasks/verification', {
      taskId,
      ...verificationData
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient