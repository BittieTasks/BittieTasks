'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle, AlertTriangle, Clock, Eye, Bot, User, Star,
  Search, Filter, ChevronDown, ArrowRight 
} from 'lucide-react'
import { useToast } from '@/app/hooks/use-toast'

interface VerificationData {
  id: string
  task_id: string
  user_id: string
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
  task: {
    title: string
    amount: number
    net_amount: number
  }
  user: {
    firstName: string
    lastName: string
  }
  created_at: string
  before_photo_url?: string
  after_photo_url?: string
}

export default function AdminVerificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [verifications, setVerifications] = useState<VerificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'ai_verified'>('pending_review')
  const [selectedVerification, setSelectedVerification] = useState<VerificationData | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchVerifications()
  }, [filter])

  const fetchVerifications = async () => {
    try {
      const response = await fetch(`/api/admin/verifications?filter=${filter}`)
      const data = await response.json()

      if (response.ok) {
        setVerifications(data.verifications || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load verifications',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load verifications',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (verificationId: string) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/verifications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          adminNotes: adminNotes.trim() || undefined
        })
      })

      if (response.ok) {
        toast({
          title: 'Approved',
          description: 'Verification approved and payment released'
        })
        fetchVerifications()
        setSelectedVerification(null)
        setAdminNotes('')
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to approve verification',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve verification',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (verificationId: string) => {
    if (!adminNotes.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/verifications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          adminNotes: adminNotes.trim()
        })
      })

      if (response.ok) {
        toast({
          title: 'Rejected',
          description: 'Verification rejected with feedback'
        })
        fetchVerifications()
        setSelectedVerification(null)
        setAdminNotes('')
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to reject verification',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject verification',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = (verification: VerificationData) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Task Verifications</h1>
              <p className="text-sm text-gray-600">Review AI and manual task verifications</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="pending_review">Pending Review</option>
                <option value="ai_verified">AI Verified</option>
                <option value="all">All Verifications</option>
              </select>
              
              <Button onClick={fetchVerifications} variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {verifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No Verifications</h3>
              <p className="text-gray-600">No verifications found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verification List */}
            <div className="space-y-4">
              {verifications.map((verification) => (
                <Card 
                  key={verification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedVerification?.id === verification.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedVerification(verification)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{verification.task.title}</CardTitle>
                        <CardDescription>
                          {verification.user.firstName} {verification.user.lastName} • 
                          ${verification.task.net_amount}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {verification.verification_type === 'ai_photo' ? (
                          <Bot className="w-4 h-4 text-blue-500" />
                        ) : (
                          <User className="w-4 h-4 text-green-500" />
                        )}
                        {getStatusIcon(verification)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(verification.status)}>
                        {verification.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      
                      {verification.ai_confidence && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-3 h-3" />
                          {verification.ai_confidence}% confidence
                        </div>
                      )}
                      
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Verification Detail */}
            {selectedVerification && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(selectedVerification)}
                      Verification Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Task Information</h4>
                      <p className="text-sm text-gray-600">{selectedVerification.task.title}</p>
                      <p className="text-sm text-gray-600">Payment: ${selectedVerification.task.net_amount}</p>
                    </div>

                    {selectedVerification.ai_confidence && (
                      <div>
                        <h4 className="font-medium mb-2">AI Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Confidence:</span>
                            <span className="text-sm font-medium">{selectedVerification.ai_confidence}%</span>
                          </div>
                          {selectedVerification.ai_details?.qualityScore && (
                            <div className="flex justify-between">
                              <span className="text-sm">Quality Score:</span>
                              <span className="text-sm font-medium">{selectedVerification.ai_details.qualityScore}/100</span>
                            </div>
                          )}
                        </div>
                        
                        {selectedVerification.ai_reasoning && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                              {selectedVerification.ai_reasoning}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Photos */}
                    {(selectedVerification.before_photo_url || selectedVerification.after_photo_url) && (
                      <div>
                        <h4 className="font-medium mb-2">Photos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedVerification.before_photo_url && (
                            <div>
                              <p className="text-sm mb-1">Before</p>
                              <img 
                                src={selectedVerification.before_photo_url}
                                alt="Before"
                                className="w-full h-32 object-cover rounded-md border"
                              />
                            </div>
                          )}
                          {selectedVerification.after_photo_url && (
                            <div>
                              <p className="text-sm mb-1">After</p>
                              <img 
                                src={selectedVerification.after_photo_url}
                                alt="After"
                                className="w-full h-32 object-cover rounded-md border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Review */}
                    {selectedVerification.status === 'pending_review' && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium">Admin Review</h4>
                        <Textarea
                          placeholder="Add notes for approval/rejection..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(selectedVerification.id)}
                            disabled={processing}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve & Release Payment
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(selectedVerification.id)}
                            disabled={processing || !adminNotes.trim()}
                            className="flex-1"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}