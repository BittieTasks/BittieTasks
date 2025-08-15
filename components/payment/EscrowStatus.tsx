import { Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface EscrowStatusProps {
  isEscrow: boolean
  escrowThreshold: number
  amount: number
  status?: 'pending' | 'escrowed' | 'released' | 'disputed'
  releaseScheduledAt?: string
  onReleaseEscrow?: () => void
  showReleaseButton?: boolean
}

export function EscrowStatus({
  isEscrow,
  escrowThreshold,
  amount,
  status = 'pending',
  releaseScheduledAt,
  onReleaseEscrow,
  showReleaseButton = false
}: EscrowStatusProps) {
  const formatTimeRemaining = (releaseDate: string) => {
    const now = new Date()
    const release = new Date(releaseDate)
    const diffMs = release.getTime() - now.getTime()
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    
    if (diffHours <= 0) return 'Ready for release'
    if (diffHours < 24) return `${diffHours} hours remaining`
    const days = Math.ceil(diffHours / 24)
    return `${days} day${days > 1 ? 's' : ''} remaining`
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'escrowed':
        return <Shield className="w-4 h-4 text-blue-500" />
      case 'released':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'disputed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Payment Processing'
      case 'escrowed':
        return 'Funds Secured in Escrow'
      case 'released':
        return 'Payment Released'
      case 'disputed':
        return 'Under Dispute Review'
      default:
        return 'Processing'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'yellow'
      case 'escrowed':
        return 'blue'
      case 'released':
        return 'green'
      case 'disputed':
        return 'red'
      default:
        return 'gray'
    }
  }

  if (!isEscrow) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Immediate Payment</p>
            <p className="text-sm text-green-600">
              Tasks under ${escrowThreshold} are processed immediately for your convenience
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Shield className="w-5 h-5" />
          Escrow Protection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">{getStatusText()}</span>
          </div>
          <Badge variant="secondary" className={`bg-${getStatusColor()}-100 text-${getStatusColor()}-800`}>
            ${amount.toFixed(2)}
          </Badge>
        </div>

        <div className="text-sm text-blue-700 space-y-2">
          <p>
            ✓ Funds secured until task completion + 24 hour review period
          </p>
          <p>
            ✓ Protection for both task poster and worker
          </p>
          {status === 'escrowed' && releaseScheduledAt && (
            <p className="font-medium">
              🕒 Auto-release: {formatTimeRemaining(releaseScheduledAt)}
            </p>
          )}
        </div>

        {showReleaseButton && status === 'escrowed' && onReleaseEscrow && (
          <Button 
            onClick={onReleaseEscrow}
            className="w-full mt-3"
            variant="default"
            size="sm"
          >
            Release Escrow Funds
          </Button>
        )}

        {status === 'released' && (
          <div className="bg-green-100 border border-green-200 rounded p-2 text-sm text-green-800">
            ✅ Funds successfully released to worker
          </div>
        )}

        <p className="text-xs text-blue-600 italic">
          Tasks ${escrowThreshold}+ use escrow protection for maximum security and trust
        </p>
      </CardContent>
    </Card>
  )
}