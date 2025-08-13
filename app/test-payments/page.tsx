'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskPaymentModal } from '../../components/TaskPaymentModal'
import { EarningsDashboard } from '../../components/EarningsDashboard'
import { useToast } from '@/hooks/use-toast'
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Camera, 
  MapPin,
  Target,
  Zap
} from 'lucide-react'

// Mock data for testing the payment system
const mockTasks = [
  {
    id: 'task-1',
    title: 'Review Local Coffee Shop',
    earningPotential: '15.00',
    type: 'platform_funded' as const,
    category: 'Reviews',
    description: 'Visit and review the coffee quality, service, and atmosphere'
  },
  {
    id: 'task-2', 
    title: 'Deliver Package to Neighbor',
    earningPotential: '8.50',
    type: 'peer_to_peer' as const,
    category: 'Delivery',
    description: 'Help deliver a package while you are running errands'
  },
  {
    id: 'task-3',
    title: 'Test New Health App Features',
    earningPotential: '25.00',
    type: 'corporate_sponsored' as const,
    category: 'Testing',
    description: 'Beta test new features and provide detailed feedback'
  }
]

const mockSubmissions = [
  {
    id: 'sub-1',
    taskId: 'task-1',
    verificationStatus: 'auto_verified',
    autoVerificationScore: 92,
    fraudDetectionScore: 15,
    qualityScore: 88,
    paymentReleased: false,
    photoEvidence: ['coffee_shop_1.jpg', 'receipt.jpg'],
    gpsVerification: true,
    timeVerification: true
  },
  {
    id: 'sub-2',
    taskId: 'task-2', 
    verificationStatus: 'manual_review',
    autoVerificationScore: 75,
    fraudDetectionScore: 35,
    qualityScore: 72,
    paymentReleased: false,
    photoEvidence: ['delivery_proof.jpg'],
    gpsVerification: true,
    timeVerification: false
  },
  {
    id: 'sub-3',
    taskId: 'task-3',
    verificationStatus: 'auto_verified',
    autoVerificationScore: 96,
    fraudDetectionScore: 8,
    qualityScore: 94,
    paymentReleased: false,
    photoEvidence: ['app_screenshot_1.jpg', 'app_screenshot_2.jpg', 'feedback_form.jpg'],
    gpsVerification: true,
    timeVerification: true
  }
]

export default function TestPaymentsPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [paymentModal, setPaymentModal] = useState(false)
  const [showEarnings, setShowEarnings] = useState(false)
  const { toast } = useToast()

  const getVerificationBadge = (status: string) => {
    const config = {
      auto_verified: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200', icon: CheckCircle, label: 'Auto-Verified' },
      manual_review: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200', icon: Clock, label: 'Manual Review' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200', icon: Clock, label: 'Rejected' }
    }

    const { color, icon: Icon, label } = config[status as keyof typeof config] || config.manual_review
    
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    )
  }

  const getTaskTypeBadge = (type: string) => {
    const colors = {
      platform_funded: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      peer_to_peer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      corporate_sponsored: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
    }
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
      </Badge>
    )
  }

  const handlePaymentTest = (submission: any) => {
    const task = mockTasks.find(t => t.id === submission.taskId)
    if (!task) return

    setSelectedSubmission({ task, submission })
    setPaymentModal(true)
  }

  const createTestSubmission = async (taskId: string) => {
    try {
      const response = await fetch('/api/tasks/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          taskId,
          participantId: 'test-participant-1',
          photoEvidence: ['test_photo_1.jpg', 'test_photo_2.jpg'],
          videoEvidence: ['test_video.mp4'],
          description: 'Test submission for payment integration',
          gpsLocation: { lat: 40.7128, lng: -74.0060 },
          timeSpent: 45,
          metadata: {
            testMode: true,
            verificationScore: 95
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Test Submission Created",
          description: `Verification score: ${result.verificationScore}/100`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stripe Payment Integration Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the complete task verification and payment system
        </p>
      </div>

      {/* Toggle View */}
      <div className="mb-6 flex gap-2">
        <Button 
          variant={!showEarnings ? "default" : "outline"}
          onClick={() => setShowEarnings(false)}
        >
          Payment Testing
        </Button>
        <Button 
          variant={showEarnings ? "default" : "outline"}
          onClick={() => setShowEarnings(true)}
        >
          Earnings Dashboard
        </Button>
      </div>

      {showEarnings ? (
        <EarningsDashboard />
      ) : (
        <div className="space-y-6">
          {/* Available Tasks for Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Available Tasks for Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      {getTaskTypeBadge(task.type)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600">
                        ${task.earningPotential}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => createTestSubmission(task.id)}
                      >
                        Create Test Submission
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mock Verified Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Verified Submissions Ready for Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSubmissions.map((submission) => {
                  const task = mockTasks.find(t => t.id === submission.taskId)
                  if (!task) return null

                  return (
                    <div key={submission.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getVerificationBadge(submission.verificationStatus)}
                            {getTaskTypeBadge(task.type)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600 text-lg">
                            ${task.earningPotential}
                          </div>
                          {submission.verificationStatus === 'auto_verified' && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePaymentTest(submission)}
                              className="mt-1"
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Test Payment
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Verification Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span>Quality: {submission.autoVerificationScore}/100</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Fraud Risk: {submission.fraudDetectionScore}/100</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Camera className="h-4 w-4 text-purple-500" />
                          <span>{submission.photoEvidence.length} Photos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span>GPS: {submission.gpsVerification ? '✓' : '✗'}</span>
                        </div>
                      </div>

                      {/* Evidence Preview */}
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-sm font-medium mb-1">Evidence Submitted:</p>
                        <div className="flex flex-wrap gap-1">
                          {submission.photoEvidence.map((photo, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              📷 {photo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">Stripe Connected</p>
                  <p className="text-sm text-gray-600">Payment processing ready</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium">Auto-Verification Active</p>
                  <p className="text-sm text-gray-600">70% submissions auto-approved</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium">Instant Payments</p>
                  <p className="text-sm text-gray-600">Immediate earnings release</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && selectedSubmission && (
        <TaskPaymentModal
          isOpen={paymentModal}
          onClose={() => {
            setPaymentModal(false)
            setSelectedSubmission(null)
          }}
          task={selectedSubmission.task}
          submission={selectedSubmission.submission}
        />
      )}
    </div>
  )
}