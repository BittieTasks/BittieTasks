'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Clock, MapPin, Users, Coins, Camera, Upload } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  category: string
  type: string
  payout: number
  location: string
  time_commitment: string
  requirements: string[]
  platform_funded?: boolean
  completion_limit?: number
  verification_type?: string
}

interface TaskApplicationModalProps {
  task: Task
  userId: string
  onSuccess?: () => void
}

export default function TaskApplicationModal({ task, userId, onSuccess }: TaskApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'apply' | 'verify'>('apply')
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [verificationPhoto, setVerificationPhoto] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Convert file to base64 for verification
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Handle camera capture or file selection
  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 10MB.",
        variant: "destructive",
      })
      return
    }

    try {
      const base64String = await convertFileToBase64(file)
      setVerificationPhoto(base64String)
      setPhotoPreview(base64String)
      
      toast({
        title: "Photo Captured!",
        description: "Your verification photo is ready to submit.",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Open camera on mobile devices
  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  // Open file picker
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Clear selected photo
  const clearPhoto = () => {
    setVerificationPhoto('')
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const handleApply = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          userId: userId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply for task')
      }

      setApplied(true)
      setStep('verify')
      toast({
        title: "Application Successful!",
        description: "You can now complete the task and submit verification.",
      })
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error instanceof Error ? error.message : "Failed to apply for task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndPay = async () => {
    if (!verificationPhoto.trim()) {
      toast({
        title: "Verification Required",
        description: "Please take a photo or provide a description to verify task completion.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tasks/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          userId: userId,
          verificationPhoto: verificationPhoto
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify task')
      }

      // Handle different verification outcomes with timing details
      if (data.verification?.status === 'approved') {
        const timingMsg = data.timing ? 
          `Processed in ${data.timing.processingTime} (submitted ${data.timing.submittedAt}, approved ${data.timing.approvedAt})` :
          ''
        toast({
          title: "AI Verified & Paid! 🎉",
          description: `${data.message} You earned $${data.payment.amount}! ${timingMsg} ${data.remainingCompletions > 0 ? `${data.remainingCompletions} completion(s) remaining.` : 'Task limit reached.'}`,
        })
      } else if (data.verification?.status === 'pending') {
        toast({
          title: "Under AI Review 🔍",
          description: `${data.message} Submitted at ${data.verification?.submissionTime || 'now'} - Manual review in progress.`,
        })
      } else {
        throw new Error(data.error || 'Verification failed')
      }

      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify task completion",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solo': return 'bg-blue-100 text-blue-800'
      case 'shared': return 'bg-green-100 text-green-800'
      case 'sponsored': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          data-testid={`button-apply-${task.id}`}
        >
          {task.platform_funded ? 'Complete Task & Earn $2' : 'Apply Now'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'apply' ? 'Apply for Task' : 'Verify Completion'}
            {task.platform_funded && (
              <Badge className="bg-teal-100 text-teal-800">Platform Funded</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'apply' ? 'Review task details and apply' : 'Submit verification to receive payment'}
          </DialogDescription>
        </DialogHeader>

        {step === 'apply' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-teal-600" />
                <span className="font-semibold">${task.payout}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{task.time_commitment}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{task.location}</span>
              </div>
            </div>

            <div>
              <Badge className={getTypeColor(task.type)}>
                {task.type === 'solo' ? 'Solo Task' : task.type === 'shared' ? 'Shared Task' : 'Sponsored Task'}
              </Badge>
              {task.completion_limit && (
                <Badge className="ml-2 bg-orange-100 text-orange-800">
                  Max {task.completion_limit} completions
                </Badge>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Requirements:</Label>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {task.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={handleApply}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700"
              data-testid={`button-confirm-apply-${task.id}`}
            >
              {loading ? 'Applying...' : 'Apply & Start Task'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg border border-teal-200">
              <h3 className="font-semibold text-teal-800">AI-Powered Verification</h3>
              <p className="text-sm text-teal-600 mt-1">
                Our smart system analyzes your submission for instant ${task.payout} payment
              </p>
              <div className="mt-2 text-xs text-teal-500">
                ✓ 70%+ confidence = Instant payment • 40-70% = Manual review • Under 40% = More details needed
              </div>
            </div>

            <div>
              <Label htmlFor="verification" className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Verification Photo
              </Label>
              
              {/* Photo Preview */}
              {photoPreview && (
                <div className="mt-2 relative">
                  <img 
                    src={photoPreview} 
                    alt="Verification preview" 
                    className="w-full max-w-sm h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearPhoto}
                  >
                    ✕
                  </Button>
                </div>
              )}

              {/* Photo Capture Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 h-12"
                  onClick={openCamera}
                  data-testid="button-take-photo"
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 h-12"
                  onClick={openFilePicker}
                  data-testid="button-upload-photo"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
                data-testid="input-camera"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoCapture}
                className="hidden"
                data-testid="input-file"
              />

              {/* Fallback text input */}
              <div className="mt-4">
                <Label htmlFor="verification-text" className="text-sm">Or describe completion (optional)</Label>
                <Textarea
                  id="verification-text"
                  placeholder="Describe how you completed this task..."
                  value={verificationPhoto.startsWith('data:') ? '' : verificationPhoto}
                  onChange={(e) => !photoPreview && setVerificationPhoto(e.target.value)}
                  className="mt-1"
                  rows={3}
                  disabled={!!photoPreview}
                  data-testid={`input-verification-${task.id}`}
                />
              </div>

              <div className="text-xs text-gray-500 mt-2">
                <p className="font-medium text-teal-600">📸 Take a clear photo showing task completion for instant AI verification and payment</p>
                <div className="mt-1 space-y-1">
                  <p><strong>Tips for better verification:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Show the completed task clearly (organized space, finished items)</li>
                    <li>Good lighting and focus help AI recognition</li>
                    <li>Include task-specific items in the photo</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleVerifyAndPay}
              disabled={loading || !verificationPhoto.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid={`button-verify-${task.id}`}
            >
              {loading ? 'Processing Payment...' : photoPreview ? 'Submit Photo & Receive $2' : `Submit & Receive $${task.payout}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}