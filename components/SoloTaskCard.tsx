'use client'

import { useState } from 'react'
import { Clock, MapPin, Coins, Users, Star, ChevronRight, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface SoloTaskCardProps {
  task: {
    id: string
    title: string
    description: string
    category: string
    payout: number
    difficulty: 'easy' | 'medium' | 'hard'
    time_estimate: string
    location_type: 'home' | 'local' | 'online'
    is_sponsored: boolean
    sponsor_name: string | null
    materials_needed?: string[]
    age_group?: string
    gross_payout?: number
    net_payout?: number
    platform_fee?: number
  }
  showApplyButton?: boolean
  compact?: boolean
}

export function SoloTaskCard({ task, showApplyButton = false, compact = false }: SoloTaskCardProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [applying, setApplying] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'home': return '🏠'
      case 'local': return '📍'
      case 'online': return '💻'
      default: return '📍'
    }
  }

  const calculateNetPayout = (grossPayout: number) => {
    const fee = Math.round(grossPayout * 0.03) // 3% platform fee for solo tasks
    return grossPayout - fee
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/solo-tasks')
      return
    }

    setApplying(true)
    try {
      const response = await fetch('/api/solo-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(user as any)?.access_token}`
        },
        body: JSON.stringify({
          task_id: task.id,
          application_message: `Applying for solo task: ${task.title}`
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Application failed')
      }

      toast({
        title: "Applied Successfully!",
        description: `You can now start working on "${task.title}". Check your dashboard to begin.`,
      })

      // Redirect to task verification page
      router.push(`/task/${task.id}/verification`)

    } catch (error: any) {
      console.error('Application error:', error)
      toast({
        title: "Application Failed",
        description: error.message || "Failed to apply to task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  const handleCardClick = () => {
    if (!showApplyButton) {
      router.push(`/task/${task.id}`)
    }
  }

  const netPayout = task.net_payout || calculateNetPayout(task.payout)
  const grossPayout = task.gross_payout || task.payout
  const platformFee = task.platform_fee || Math.round(grossPayout * 0.03)

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow group ${!showApplyButton ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
            {task.difficulty}
          </Badge>
          {task.is_sponsored && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Sponsored
            </Badge>
          )}
        </div>
        <CardTitle className={`${compact ? 'text-base' : 'text-lg'} group-hover:text-blue-600 transition-colors`}>
          {task.title}
        </CardTitle>
        {task.sponsor_name && (
          <p className="text-xs text-purple-600">by {task.sponsor_name}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
          {task.description}
        </p>

        {/* Task Details */}
        <div className={`space-y-${compact ? '1' : '2'}`}>
          <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <span className="text-base">{getLocationIcon(task.location_type)}</span>
            <span className="text-gray-600 capitalize">{task.location_type}</span>
          </div>

          <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">{task.time_estimate}</span>
          </div>

          <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {task.category}
            </span>
          </div>

          {task.age_group && (
            <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
              <Users className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">Ages {task.age_group}</span>
            </div>
          )}
        </div>

        {/* Materials Needed */}
        {!compact && task.materials_needed && task.materials_needed.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Materials needed:</p>
            <div className="flex flex-wrap gap-1">
              {task.materials_needed.slice(0, 3).map((material, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {material}
                </span>
              ))}
              {task.materials_needed.length > 3 && (
                <span className="text-xs text-gray-500">+{task.materials_needed.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Payout */}
        <div className="border-t pt-4">
          {showApplyButton ? (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${netPayout}
                </div>
                <div className="text-xs text-gray-500">
                  ${grossPayout} gross - ${platformFee} fee (3%)
                </div>
              </div>
              <Button 
                onClick={handleApply}
                disabled={applying}
                className="w-full"
                data-testid={`apply-task-${task.id}`}
              >
                {applying ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Now
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${netPayout}
                </div>
                <div className="text-xs text-gray-500">
                  ${grossPayout} gross - 3% fee
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}