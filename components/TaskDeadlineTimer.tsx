'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TaskDeadlineTimerProps {
  deadline: string
  isExtended?: boolean
  className?: string
}

export default function TaskDeadlineTimer({ deadline, isExtended = false, className = "" }: TaskDeadlineTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    isExpired: boolean
  }>({ hours: 0, minutes: 0, isExpired: false })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const deadlineTime = new Date(deadline).getTime()
      const difference = deadlineTime - now

      if (difference <= 0) {
        return { hours: 0, minutes: 0, isExpired: true }
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      return { hours, minutes, isExpired: false }
    }

    // Update immediately
    setTimeLeft(calculateTimeLeft())

    // Update every minute
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000)

    return () => clearInterval(timer)
  }, [deadline])

  if (timeLeft.isExpired) {
    return (
      <Badge variant="destructive" className={`${className} flex items-center gap-1`}>
        <AlertTriangle className="h-3 w-3" />
        Expired
      </Badge>
    )
  }

  const getTimerColor = () => {
    if (timeLeft.hours < 2) return 'bg-red-100 text-red-800 border-red-200'
    if (timeLeft.hours < 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getTimerIcon = () => {
    if (timeLeft.hours < 2) return <AlertTriangle className="h-3 w-3" />
    return <Clock className="h-3 w-3" />
  }

  const formatTime = () => {
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m left`
    }
    return `${timeLeft.minutes}m left`
  }

  return (
    <div className={`${className} flex items-center gap-2`}>
      <Badge variant="outline" className={`flex items-center gap-1 ${getTimerColor()}`}>
        {getTimerIcon()}
        {formatTime()}
      </Badge>
      {isExtended && (
        <Badge variant="secondary" className="text-xs">
          Extended
        </Badge>
      )}
    </div>
  )
}