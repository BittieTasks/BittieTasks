'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertTriangle, Eye, Bot, User, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VerificationData {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'pending_review'
  verification_type: 'ai_photo' | 'manual' | 'admin'
  ai_confidence?: number
  ai_reasoning?: string
  ai_details?: {
    taskCompleted: boolean
    qualityScore: number
    issuesFound: string[]
    positiveAspects: string[]
  }
  before_photo_url?: string
  after_photo_url?: string
  verification_notes?: string
  admin_notes?: string
  created_at: string
  reviewed_at?: string
  reviewer_id?: string
}

interface VerificationStatusProps {
  taskId: string
  verificationId?: string
  showPhotos?: boolean
  onStatusChange?: (status: string) => void
}

export function VerificationStatus({
  taskId,
  verificationId,
  showPhotos = false,
  onStatusChange
}: VerificationStatusProps) {
  const [verification, setVerification] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (verificationId) {
      fetchVerificationStatus()
    }
  }, [verificationId])

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch(`/api/tasks/verification?id=${verificationId}`)
      const data = await response.json()

      if (response.ok) {
        setVerification(data.verification)
        onStatusChange?.(data.verification.status)
      } else {
        setError(data.error || 'Failed to load verification status')
      }
    } catch (err) {
      setError('Unable to fetch verification status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!verification) return <Clock className="w-5 h-5 text-gray-500" />

    switch (verification.status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'pending_review':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    if (!verification) return 'gray'

    switch (verification.status) {
      case 'approved':
        return 'green'
      case 'rejected':
        return 'red'
      case 'pending_review':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const getStatusText = () => {
    if (!verification) return 'Loading...'

    switch (verification.status) {
      case 'approved':
        return 'Verified & Approved'
      case 'rejected':
        return 'Verification Failed'
      case 'pending_review':
        return 'Under Manual Review'
      default:
        return 'Pending Verification'
    }
  }

  const getVerificationTypeIcon = () => {
    if (!verification) return null

    switch (verification.verification_type) {
      case 'ai_photo':
        return <Bot className="w-4 h-4" />
      case 'manual':
      case 'admin':
        return <User className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 animate-spin" />
            <span>Loading verification status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!verification) {
    return (
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          No verification submitted yet. Upload photos to verify task completion.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Task Verification
        </CardTitle>
        <CardDescription>
          Submitted {new Date(verification.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            {getVerificationTypeIcon()}
          </div>
          <Badge 
            variant="outline" 
            className={`bg-${getStatusColor()}-50 text-${getStatusColor()}-800 border-${getStatusColor()}-200`}
          >
            {getStatusText()}
          </Badge>
        </div>

        {verification.ai_confidence !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">AI Confidence:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{verification.ai_confidence}%</span>
                <Bot className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            
            {verification.ai_details?.qualityScore !== undefined && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Quality Score:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{verification.ai_details.qualityScore}/100</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            )}
          </div>
        )}

        {verification.ai_reasoning && (
          <div className="space-y-2">
            <span className="font-medium">AI Analysis:</span>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {verification.ai_reasoning}
            </p>
          </div>
        )}

        {verification.ai_details?.positiveAspects?.length > 0 && (
          <div className="space-y-2">
            <span className="font-medium text-green-700">What Was Done Well:</span>
            <ul className="text-sm text-green-600 space-y-1">
              {verification.ai_details.positiveAspects.map((aspect: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {aspect}
                </li>
              ))}
            </ul>
          </div>
        )}

        {verification.ai_details?.issuesFound?.length > 0 && (
          <div className="space-y-2">
            <span className="font-medium text-red-700">Issues Found:</span>
            <ul className="text-sm text-red-600 space-y-1">
              {verification.ai_details.issuesFound.map((issue: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {verification.verification_notes && (
          <div className="space-y-2">
            <span className="font-medium">Submitted Notes:</span>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {verification.verification_notes}
            </p>
          </div>
        )}

        {verification.admin_notes && (
          <div className="space-y-2">
            <span className="font-medium">Reviewer Notes:</span>
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
              {verification.admin_notes}
            </p>
          </div>
        )}

        {verification.status === 'pending_review' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your submission is under manual review by our team. You'll receive notification within 24 hours.
            </AlertDescription>
          </Alert>
        )}

        {verification.status === 'approved' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Task verified successfully! Payment processing has been initiated.
            </AlertDescription>
          </Alert>
        )}

        {showPhotos && (verification.before_photo_url || verification.after_photo_url) && (
          <div className="space-y-3">
            <span className="font-medium">Verification Photos:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verification.before_photo_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Before</p>
                  <img 
                    src={verification.before_photo_url} 
                    alt="Before photo"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}
              {verification.after_photo_url && (
                <div>
                  <p className="text-sm font-medium mb-2">After</p>
                  <img 
                    src={verification.after_photo_url} 
                    alt="After photo"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}