'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Note: Using custom tabs implementation since @/components/ui/tabs may not be available
// Will implement basic tab functionality with state
import TaskApprovalStatus from '@/components/TaskApprovalStatus'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { CheckCircle, XCircle, Clock, Flag, AlertTriangle, Users, TrendingUp } from 'lucide-react'

// Mock data for demonstration - replace with actual API calls
const mockPendingTasks = [
  {
    id: '1',
    title: 'After-school homework help',
    description: 'Looking for someone to help with elementary math homework',
    creator: 'Sarah M.',
    payout: 25,
    status: 'manual_review',
    reviewTier: 'enhanced_review',
    riskScore: 35,
    reasons: ['Contains education-related content requiring verification'],
    createdAt: '2025-01-12T10:00:00Z',
    category: 'Education'
  },
  {
    id: '2', 
    title: 'Neighborhood grocery shopping',
    description: 'Need someone to help with weekly grocery shopping for elderly neighbor',
    creator: 'Mike T.',
    payout: 40,
    status: 'manual_review',
    reviewTier: 'standard_review',
    riskScore: 15,
    reasons: ['New user - additional verification needed'],
    createdAt: '2025-01-12T09:30:00Z',
    category: 'Community Support'
  },
  {
    id: '3',
    title: 'Babysitting for date night',
    description: 'Looking for experienced babysitter for 2 young children',
    creator: 'Emma R.',
    payout: 60,
    status: 'flagged',
    reviewTier: 'enhanced_review',
    riskScore: 85,
    reasons: ['Contains prohibited content: babysitting', 'Childcare services not permitted'],
    createdAt: '2025-01-12T08:15:00Z',
    category: 'Childcare'
  }
]

const mockApprovedTasks = [
  {
    id: '4',
    title: 'Community garden maintenance',
    description: 'Help maintain the neighborhood community garden',
    creator: 'Alex K.',
    payout: 30,
    status: 'auto_approved',
    reviewTier: 'auto_approve',
    riskScore: 5,
    reasons: ['Automatically approved - meets all safety criteria'],
    approvedAt: '2025-01-12T07:00:00Z',
    approvedBy: 'system',
    category: 'Community Support'
  }
]

export default function AdminApprovalsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleApprove = async (taskId: string) => {
    console.log('Approving task:', taskId)
    // API call to approve task
    alert('Task approved successfully!')
  }

  const handleReject = async (taskId: string, reason: string) => {
    console.log('Rejecting task:', taskId, 'Reason:', reason)
    // API call to reject task
    alert('Task rejected successfully!')
  }

  const getTasksByStatus = (status: string) => {
    if (status === 'pending') {
      return mockPendingTasks.filter(task => 
        task.status === 'manual_review' || task.status === 'pending'
      )
    }
    if (status === 'flagged') {
      return mockPendingTasks.filter(task => task.status === 'flagged')
    }
    if (status === 'approved') {
      return mockApprovedTasks
    }
    return []
  }

  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            Task Approval Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Review and manage task submissions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {getTasksByStatus('pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-600" />
                Flagged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {getTasksByStatus('flagged').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getTasksByStatus('approved').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Auto-Approval Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">78%</div>
            </CardContent>
          </Card>
        </div>

        {/* Task Lists */}
        <div>
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6">
            <button
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'pending' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Review
            </button>
            <button
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'flagged' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('flagged')}
            >
              Flagged Tasks
            </button>
            <button
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'approved' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('approved')}
            >
              Recently Approved
            </button>
          </div>
          
          {activeTab === 'pending' && (
            <div className="space-y-4">
            {getTasksByStatus('pending').map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>
                        By {task.creator} • ${task.payout} • {task.category}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{task.reviewTier.replace('_', ' ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{task.description}</p>
                  
                  <TaskApprovalStatus 
                    status={task.status as any}
                    reviewTier={task.reviewTier as any}
                    riskScore={task.riskScore}
                    reasons={task.reasons}
                  />
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(task.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReject(task.id, 'Manual review rejection')}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
          
          {activeTab === 'flagged' && (
            <div className="space-y-4">
            {getTasksByStatus('flagged').map((task) => (
              <Card key={task.id} className="border-red-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        {task.title}
                      </CardTitle>
                      <CardDescription>
                        By {task.creator} • ${task.payout} • {task.category}
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">HIGH RISK</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{task.description}</p>
                  
                  <TaskApprovalStatus 
                    status={task.status as any}
                    reviewTier={task.reviewTier as any}
                    riskScore={task.riskScore}
                    reasons={task.reasons}
                  />
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReject(task.id, 'Policy violation')}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject & Block
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
          
          {activeTab === 'approved' && (
            <div className="space-y-4">
            {getTasksByStatus('approved').map((task) => (
              <Card key={task.id} className="border-green-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>
                        By {task.creator} • ${task.payout} • {task.category}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">APPROVED</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                  
                  <TaskApprovalStatus 
                    status={task.status as any}
                    reviewTier={task.reviewTier as any}
                    riskScore={task.riskScore}
                    reasons={task.reasons}
                    approvedAt={(task as any).approvedAt}
                    approvedBy={(task as any).approvedBy}
                  />
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </main>
    </CleanLayout>
  )
}