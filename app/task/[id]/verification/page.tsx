'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../../components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { useRouter, useParams } from 'next/navigation'
import { 
  Camera, 
  Video, 
  MapPin, 
  Clock, 
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Target,
  Award,
  FileText,
  Share2,
  DollarSign
} from 'lucide-react'

interface VerificationRequirement {
  id: string
  taskId: string
  revenueStream: string
  requiredMethods: string[]
  photoRequirements?: {
    count: number
    requiresLocation: boolean
    requiresTimestamp: boolean
    beforeAfter?: boolean
    requiresBrandVisible?: boolean
  }
  videoRequirements?: {
    minDuration: number
    maxDuration: number
    requiresAudio: boolean
  }
  locationRequirements?: {
    radius: number
    specificAddress?: string
  }
  timeRequirements?: {
    minDuration: number
    trackingInterval?: number
  }
  additionalRequirements?: string
  autoApprovalCriteria?: {
    gpsAccuracy: number
    photoQuality: number
    timeCompliance: number
  }
}

interface Task {
  id: string
  title: string
  description: string
  type: string
  earningPotential: string
  location: string
  duration: string
  requirements: string
}

export default function TaskVerificationPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  
  const [mounted, setMounted] = useState(false)
  const [task, setTask] = useState<Task | null>(null)
  const [requirements, setRequirements] = useState<VerificationRequirement | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  // Verification data
  const [photos, setPhotos] = useState<File[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [gpsTracking, setGpsTracking] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [communityConfirmation, setCommunityConfirmation] = useState('')
  const [receipts, setReceipts] = useState<File[]>([])
  const [socialProofUrls, setSocialProofUrls] = useState<string[]>([''])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth')
    }
  }, [mounted, isAuthenticated, router])

  useEffect(() => {
    if (mounted && isAuthenticated && taskId) {
      fetchTaskData()
    }
  }, [mounted, isAuthenticated, taskId])

  const fetchTaskData = async () => {
    try {
      setLoading(true)
      
      // Fetch task details
      const taskResponse = await fetch(`/api/tasks/${taskId}`)
      if (taskResponse.ok) {
        const taskData = await taskResponse.json()
        setTask(taskData)
      }
      
      // Fetch verification requirements
      const reqResponse = await fetch(`/api/tasks/${taskId}/requirements`)
      if (reqResponse.ok) {
        const reqData = await reqResponse.json()
        setRequirements(reqData)
      }
      
    } catch (error) {
      console.error('Error fetching task data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startGPSTracking = () => {
    if ('geolocation' in navigator) {
      setGpsTracking(true)
      setStartTime(new Date())
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position)
        },
        (error) => {
          console.error('GPS error:', error)
          alert('Unable to get location. Please enable location services.')
        },
        { enableHighAccuracy: true }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  const stopGPSTracking = () => {
    setGpsTracking(false)
    setEndTime(new Date())
  }

  const handleFileUpload = (files: FileList | null, type: 'photo' | 'video' | 'receipt') => {
    if (!files) return
    
    const fileArray = Array.from(files)
    
    switch (type) {
      case 'photo':
        setPhotos(prev => [...prev, ...fileArray])
        break
      case 'video':
        setVideos(prev => [...prev, ...fileArray])
        break
      case 'receipt':
        setReceipts(prev => [...prev, ...fileArray])
        break
    }
  }

  const addSocialProofUrl = () => {
    setSocialProofUrls(prev => [...prev, ''])
  }

  const updateSocialProofUrl = (index: number, url: string) => {
    setSocialProofUrls(prev => {
      const updated = [...prev]
      updated[index] = url
      return updated
    })
  }

  const submitVerification = async () => {
    if (!task || !requirements) return
    
    try {
      setSubmitting(true)
      
      // Upload files first (mock implementation - would use actual file upload service)
      const photoUrls = photos.map(photo => `uploads/photos/${photo.name}`)
      const videoUrls = videos.map(video => `uploads/videos/${video.name}`)
      const receiptUrls = receipts.map(receipt => `uploads/receipts/${receipt.name}`)
      
      const submissionData = {
        taskId,
        participantId: `participant-${user?.id}-${taskId}`, // Would get from task participation
        verificationMethods: requirements.requiredMethods,
        photoUrls,
        videoUrls,
        photoMetadata: photos.length > 0 ? {
          gpsCoordinates: location ? [location.coords.latitude, location.coords.longitude] : undefined,
          timestamp: new Date().toISOString(),
          deviceInfo: navigator.userAgent
        } : undefined,
        videoMetadata: videos.length > 0 ? {
          duration: 120, // Would extract from video
          resolution: "1920x1080", // Would extract from video
          timestamp: new Date().toISOString()
        } : undefined,
        gpsCoordinates: location ? [`${location.coords.latitude},${location.coords.longitude}`] : [],
        locationHistory: gpsTracking && location ? {
          coordinates: [[location.coords.latitude, location.coords.longitude]],
          timestamps: [new Date().toISOString()]
        } : undefined,
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
        totalDuration: startTime && endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : undefined,
        communityVerifications: communityConfirmation ? {
          hostConfirmation: true,
          witnessConfirmations: [communityConfirmation]
        } : undefined,
        receiptUrls,
        socialProofUrls: socialProofUrls.filter(url => url.trim() !== ''),
        completionNotes
      }
      
      const response = await fetch('/api/tasks/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Show success message based on verification status
        if (result.verificationStatus === 'auto_verified') {
          alert(`✅ Task automatically verified! You've earned $${task.earningPotential}. Payment processed immediately.`)
        } else if (result.verificationStatus === 'manual_review') {
          alert('📋 Submission under review. You\'ll be notified within 24 hours of the decision.')
        } else {
          alert(`📝 ${result.nextSteps}`)
        }
        
        router.push(`/task/${taskId}`)
      } else {
        const error = await response.json()
        alert('Failed to submit verification: ' + (error.message || 'Unknown error'))
      }
      
    } catch (error) {
      console.error('Verification submission error:', error)
      alert('Failed to submit verification. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null
  if (!isAuthenticated) return null
  if (loading) {
    return (
      <CleanLayout>
        <CleanNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CleanLayout>
    )
  }

  if (!task || !requirements) {
    return (
      <CleanLayout>
        <CleanNavigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The task or verification requirements could not be loaded.
              </p>
              <Button onClick={() => router.push('/marketplace')}>
                Back to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </CleanLayout>
    )
  }

  const getRevenueStreamBadge = (stream: string) => {
    switch (stream) {
      case 'platform_funded':
        return <Badge className="bg-blue-100 text-blue-800">Platform Funded</Badge>
      case 'corporate_partnership':
        return <Badge className="bg-purple-100 text-purple-800">Corporate Sponsored</Badge>
      case 'peer_to_peer':
        return <Badge className="bg-green-100 text-green-800">Peer-to-Peer</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Standard</Badge>
    }
  }

  const getVerificationIcon = (method: string) => {
    switch (method) {
      case 'photo': return <Camera className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'gps_tracking': return <MapPin className="h-4 w-4" />
      case 'time_tracking': return <Clock className="h-4 w-4" />
      case 'receipt_upload': return <FileText className="h-4 w-4" />
      case 'social_proof': return <Share2 className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const requiredMethods = requirements.requiredMethods || []
  const progress = Math.round((currentStep / requiredMethods.length) * 100)

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">{task.title}</h1>
            {getRevenueStreamBadge(requirements.revenueStream)}
          </div>
          <p className="text-lg text-muted-foreground mb-4">{task.description}</p>
          
          {/* Earning Info */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">
                    Complete verification to earn ${task.earningPotential}
                  </p>
                  <p className="text-sm text-green-600">
                    {requirements.revenueStream === 'platform_funded' 
                      ? 'Paid directly by BittieTasks'
                      : requirements.revenueStream === 'corporate_partnership'
                      ? 'Sponsored by corporate partner'
                      : 'Paid by community member'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Verification Progress
            </CardTitle>
            <CardDescription>
              Complete all required verification steps to receive payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Step {currentStep + 1} of {requiredMethods.length}
                </span>
                <span className="text-sm text-muted-foreground">{progress}% complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Verification Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photo Verification */}
          {requiredMethods.includes('photo') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo Verification
                </CardTitle>
                <CardDescription>
                  {requirements.photoRequirements?.count || 1} photo(s) required
                  {requirements.photoRequirements?.requiresLocation && ' • GPS location required'}
                  {requirements.photoRequirements?.beforeAfter && ' • Before/after photos'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="photos">Upload Photos</Label>
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, 'photo')}
                    className="mt-1"
                  />
                  {photos.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {photos.length} photo(s) selected
                    </p>
                  )}
                </div>
                
                {requirements.photoRequirements?.requiresLocation && (
                  <div>
                    <Button
                      onClick={startGPSTracking}
                      disabled={gpsTracking || !!location}
                      className="w-full"
                      variant={location ? "secondary" : "default"}
                    >
                      {location ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Location Captured
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Capture Location
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Video Verification */}
          {requiredMethods.includes('video') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Verification
                </CardTitle>
                <CardDescription>
                  {requirements.videoRequirements?.minDuration 
                    ? `${requirements.videoRequirements.minDuration}s minimum duration`
                    : 'Video proof required'
                  }
                  {requirements.videoRequirements?.requiresAudio && ' • Audio required'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="videos">Upload Video</Label>
                  <Input
                    id="videos"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e.target.files, 'video')}
                    className="mt-1"
                  />
                  {videos.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {videos.length} video(s) selected
                    </p>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  <p><strong>Video Guidelines:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Record in good lighting</li>
                    <li>Show clear completion of the task</li>
                    <li>Speak clearly if audio is required</li>
                    <li>Keep recording continuous (no cuts)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* GPS Tracking */}
          {requiredMethods.includes('gps_tracking') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  GPS Tracking
                </CardTitle>
                <CardDescription>
                  Track your location during task completion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={startGPSTracking}
                    disabled={gpsTracking}
                    className="flex-1"
                    variant={gpsTracking ? "secondary" : "default"}
                  >
                    {gpsTracking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Start Tracking
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={stopGPSTracking}
                    disabled={!gpsTracking}
                    variant="outline"
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Stop Tracking
                  </Button>
                </div>
                
                {location && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                    Location captured: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Time Tracking */}
          {requiredMethods.includes('time_tracking') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Tracking
                </CardTitle>
                <CardDescription>
                  {requirements.timeRequirements?.minDuration 
                    ? `Minimum ${Math.floor(requirements.timeRequirements.minDuration / 60)} minutes required`
                    : 'Track time spent on task'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <div className="text-sm text-muted-foreground">
                      {startTime ? startTime.toLocaleTimeString() : 'Not started'}
                    </div>
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <div className="text-sm text-muted-foreground">
                      {endTime ? endTime.toLocaleTimeString() : 'Not finished'}
                    </div>
                  </div>
                </div>
                
                {startTime && endTime && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                    Total duration: {Math.round((endTime.getTime() - startTime.getTime()) / 60000)} minutes
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Community Verification */}
          {requiredMethods.includes('community_verification') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Community Verification
                </CardTitle>
                <CardDescription>
                  Get confirmation from task host or witnesses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="community">Host/Witness Confirmation</Label>
                  <Textarea
                    id="community"
                    placeholder="Enter confirmation details or contact information..."
                    value={communityConfirmation}
                    onChange={(e) => setCommunityConfirmation(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Receipt Upload */}
          {requiredMethods.includes('receipt_upload') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Receipt Upload
                </CardTitle>
                <CardDescription>
                  Upload receipts or purchase documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="receipts">Upload Receipts</Label>
                  <Input
                    id="receipts"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, 'receipt')}
                    className="mt-1"
                  />
                  {receipts.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {receipts.length} receipt(s) selected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Proof */}
          {requiredMethods.includes('social_proof') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Proof
                </CardTitle>
                <CardDescription>
                  Share your completion on social media or provide public documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialProofUrls.map((url, index) => (
                  <div key={index}>
                    <Label>Social Media Link {index + 1}</Label>
                    <Input
                      placeholder="https://twitter.com/yourpost or https://instagram.com/yourpost"
                      value={url}
                      onChange={(e) => updateSocialProofUrl(index, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                ))}
                <Button
                  onClick={addSocialProofUrl}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Add Another Link
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Completion Notes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Completion Notes (Optional)</CardTitle>
            <CardDescription>
              Add any additional details about your task completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your experience, any challenges faced, or additional details..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        {/* Submission */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={submitVerification}
                disabled={submitting}
                className="flex-1"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Verification...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Verification
                  </>
                )}
              </Button>
              <Button
                onClick={() => router.push(`/task/${taskId}`)}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>What happens next:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Your submission will be automatically reviewed</li>
                <li>Most tasks are approved within minutes</li>
                <li>Payment is processed immediately upon approval</li>
                <li>You'll receive an email confirmation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </CleanLayout>
  )
}