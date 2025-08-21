'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, CheckCircle, Clock, FileText, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { useToast } from @/app/hooks/use-toast'

interface SoloTaskVerificationProps {
  task: {
    id: string
    title: string
    description: string
    category: string
    payout: number
    time_estimate: string
    materials_needed?: string[]
  }
  onVerificationComplete?: (result: any) => void
}

export function SoloTaskVerification({ task, onVerificationComplete }: SoloTaskVerificationProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [completionDescription, setCompletionDescription] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [verificationPhotos, setVerificationPhotos] = useState<string[]>([])
  const [photoPreview, setPhotoPreview] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Convert file to base64
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

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select only image files.",
          variant: "destructive",
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select images under 10MB each.",
          variant: "destructive",
        })
        return
      }
    }

    try {
      const base64Files = await Promise.all(files.map(convertFileToBase64))
      
      setVerificationPhotos(prev => [...prev, ...base64Files])
      setPhotoPreview(prev => [...prev, ...base64Files])
      
      toast({
        title: "Photos Added!",
        description: `${files.length} photo(s) ready for submission.`,
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process images. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setVerificationPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreview(prev => prev.filter((_, i) => i !== index))
  }

  // Submit verification
  const handleSubmit = async () => {
    if (!completionDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe what you completed.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/solo-tasks/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(user as any)?.access_token}`
        },
        body: JSON.stringify({
          task_id: task.id,
          completion_description: completionDescription,
          completion_notes: completionNotes,
          verification_photos: verificationPhotos
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Verification failed')
      }

      setSubmitted(true)
      
      toast({
        title: result.auto_approved ? "Task Verified!" : "Task Submitted!",
        description: result.message,
      })

      onVerificationComplete?.(result)

    } catch (error: any) {
      console.error('Verification error:', error)
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to submit verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const calculateNetPayout = () => {
    const fee = Math.round(task.payout * 0.03)
    return task.payout - fee
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Task Submitted Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your task completion has been submitted for verification. 
            You'll receive payment once approved.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-800">Expected Earnings:</span>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  ${calculateNetPayout()}
                </div>
                <div className="text-xs text-green-600">
                  (${task.payout} - 3% fee)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Task Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Task Completion Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-900">{task.title}</p>
              <p className="text-sm text-gray-600 mt-1">{task.category}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${calculateNetPayout()}
              </div>
              <div className="text-xs text-gray-500">
                ${task.payout} gross - 3% fee
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Describe Your Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              What did you complete? *
            </label>
            <Textarea
              placeholder="Describe what you accomplished, the steps you took, and the outcome. Be specific and detailed..."
              value={completionDescription}
              onChange={(e) => setCompletionDescription(e.target.value)}
              rows={4}
              className="w-full"
              data-testid="completion-description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Notes (Optional)
            </label>
            <Textarea
              placeholder="Any challenges, insights, or extra details about your work..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
              className="w-full"
              data-testid="completion-notes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Verification Photos</CardTitle>
          <p className="text-sm text-gray-600">
            Photos help verify your work and speed up approval. Show before/after, final results, or process documentation.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
              data-testid="upload-photos-button"
            >
              <Upload className="h-4 w-4" />
              Upload Photos
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2"
              data-testid="take-photo-button"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Photo Preview */}
          {photoPreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photoPreview.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Verification ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium">Ready to submit?</p>
              <p className="text-sm text-gray-600">
                Your work will be reviewed and you'll receive payment upon approval.
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                ${calculateNetPayout()}
              </div>
              <Badge variant="outline" className="text-xs">
                {task.time_estimate}
              </Badge>
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={submitting || !completionDescription.trim()}
            className="w-full"
            size="lg"
            data-testid="submit-verification"
          >
            {submitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Submitting Verification...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}