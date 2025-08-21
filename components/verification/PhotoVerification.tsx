'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, CheckCircle, AlertTriangle, Clock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/app/hooks/use-toast'
import { useAuth } from '@/components/auth/SimpleAuthProvider'

interface PhotoVerificationProps {
  taskId: string
  taskTitle: string
  taskDescription: string
  onVerificationComplete?: (result: any) => void
  requireBeforePhoto?: boolean
}

export function PhotoVerification({
  taskId,
  taskTitle,
  taskDescription,
  onVerificationComplete,
  requireBeforePhoto = false
}: PhotoVerificationProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [beforePhoto, setBeforePhoto] = useState<string>('')
  const [afterPhoto, setAfterPhoto] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  
  const beforeFileRef = useRef<HTMLInputElement>(null)
  const afterFileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File, type: 'before' | 'after') => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 10MB',
        variant: 'destructive'
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      const base64Data = base64.split(',')[1] // Remove data:image/...;base64, prefix
      
      if (type === 'before') {
        setBeforePhoto(base64Data)
      } else {
        setAfterPhoto(base64Data)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitVerification = async () => {
    if (!afterPhoto) {
      toast({
        title: 'Photo Required',
        description: 'Please upload an after photo to verify task completion',
        variant: 'destructive'
      })
      return
    }

    if (requireBeforePhoto && !beforePhoto) {
      toast({
        title: 'Before Photo Required',
        description: 'This task requires both before and after photos',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/tasks/ai-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          beforePhoto: beforePhoto || null,
          afterPhoto,
          notes,
          userId: user?.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed')
      }

      setVerificationResult(result)
      
      // Show appropriate success message
      if (result.verification.verified && !result.verification.requiresManualReview) {
        toast({
          title: 'Task Verified!',
          description: `Your work has been verified with ${result.verification.confidence}% confidence. ${result.autoReleased ? 'Payment has been released!' : 'Payment will be processed shortly.'}`
        })
      } else if (result.verification.requiresManualReview) {
        toast({
          title: 'Manual Review Required',
          description: 'Your submission will be reviewed by our team within 24 hours.',
          variant: 'default'
        })
      } else {
        toast({
          title: 'Verification Issues Found',
          description: result.verification.reasoning,
          variant: 'destructive'
        })
      }

      onVerificationComplete?.(result)

    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Unable to process verification',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!verificationResult) return null
    
    const { verified, requiresManualReview } = verificationResult.verification
    
    if (verified && !requiresManualReview) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (requiresManualReview) {
      return <Clock className="w-5 h-5 text-yellow-600" />
    } else {
      return <AlertTriangle className="w-5 h-5 text-red-600" />
    }
  }

  const getStatusColor = () => {
    if (!verificationResult) return 'gray'
    
    const { verified, requiresManualReview } = verificationResult.verification
    
    if (verified && !requiresManualReview) return 'green'
    if (requiresManualReview) return 'yellow'
    return 'red'
  }

  if (verificationResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Verification Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge variant="outline" className={`bg-${getStatusColor()}-50 text-${getStatusColor()}-800 border-${getStatusColor()}-200`}>
              {verificationResult.verification.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Confidence:</span>
            <span className="text-lg font-bold">{verificationResult.verification.confidence}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Quality Score:</span>
            <span className="text-lg font-bold">{verificationResult.verification.qualityScore}/100</span>
          </div>

          <div className="space-y-2">
            <span className="font-medium">AI Analysis:</span>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {verificationResult.verification.reasoning}
            </p>
          </div>

          {verificationResult.verification.suggestions?.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium">Suggestions:</span>
              <ul className="text-sm text-gray-600 space-y-1">
                {verificationResult.verification.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              {verificationResult.autoReleased 
                ? "Payment has been automatically released to your account!"
                : verificationResult.verification.requiresManualReview
                  ? "Your submission is under manual review. You'll be notified within 24 hours."
                  : "Your task completion has been recorded."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Photo Verification
        </CardTitle>
        <CardDescription>
          Upload photos to verify completion of: <strong>{taskTitle}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Task Description:</h4>
          <p className="text-blue-700 text-sm">{taskDescription}</p>
        </div>

        {requireBeforePhoto && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Before Photo</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {beforePhoto ? (
                <div className="space-y-3">
                  <img 
                    src={`data:image/jpeg;base64,${beforePhoto}`}
                    alt="Before"
                    className="max-w-full h-48 object-cover rounded-md mx-auto"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => beforeFileRef.current?.click()}
                  >
                    Replace Photo
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">Upload a photo showing the initial state</p>
                  <Button 
                    variant="outline"
                    onClick={() => beforeFileRef.current?.click()}
                  >
                    Choose Photo
                  </Button>
                </div>
              )}
              <input
                ref={beforeFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'before')}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-medium">
            After Photo <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {afterPhoto ? (
              <div className="space-y-3">
                <img 
                  src={`data:image/jpeg;base64,${afterPhoto}`}
                  alt="After"
                  className="max-w-full h-48 object-cover rounded-md mx-auto"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => afterFileRef.current?.click()}
                >
                  Replace Photo
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">Upload a photo showing the completed work</p>
                <Button 
                  variant="outline"
                  onClick={() => afterFileRef.current?.click()}
                >
                  Choose Photo
                </Button>
              </div>
            )}
            <input
              ref={afterFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'after')}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Additional Notes (Optional)</label>
          <Textarea
            placeholder="Describe any challenges, extra work done, or special circumstances..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Alert>
          <Camera className="h-4 w-4" />
          <AlertDescription>
            Our AI system will analyze your photos to verify task completion. High-quality, well-lit photos help ensure accurate verification.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleSubmitVerification}
          disabled={loading || !afterPhoto}
          className="w-full"
          size="lg"
        >
          {loading ? 'Verifying...' : 'Submit for Verification'}
        </Button>
      </CardContent>
    </Card>
  )
}