'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  Home, Users, Building2, ArrowRightLeft, User, Settings, 
  Menu, X, ChevronRight, Loader2
} from 'lucide-react'
import DashboardSection from '@/components/sections/DashboardSection'
import SoloTasksSection from '@/components/sections/SoloTasksSection'
import TaskApplicationModal from '@/components/TaskApplicationModal'

type AppSection = 'dashboard' | 'solo' | 'community' | 'corporate' | 'barter' | 'profile' | 'settings'

interface AuthenticatedAppProps {
  initialSection?: AppSection
}

export default function AuthenticatedApp({ initialSection = 'dashboard' }: AuthenticatedAppProps) {
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState<AppSection>(initialSection)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)

  // Navigation sections with enhanced metadata
  const sections = [
    { 
      id: 'dashboard' as AppSection, 
      label: 'Dashboard', 
      icon: Home, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      description: 'Your earnings and activity overview'
    },
    { 
      id: 'solo' as AppSection, 
      label: 'Solo Tasks', 
      icon: User, 
      color: 'text-teal-600', 
      bgColor: 'bg-teal-50',
      description: 'Platform-funded tasks • 3% fee',
      badge: 'Hot'
    },
    { 
      id: 'community' as AppSection, 
      label: 'Community', 
      icon: Users, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      description: 'Neighbor coordination • 7% fee'
    },
    { 
      id: 'corporate' as AppSection, 
      label: 'Corporate', 
      icon: Building2, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      description: 'Business partnerships • 15% fee'
    },
    { 
      id: 'barter' as AppSection, 
      label: 'Barter Exchange', 
      icon: ArrowRightLeft, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      description: 'Trade services • 0% fees'
    },
  ]

  // Handle section navigation
  const navigateToSection = (sectionId: AppSection) => {
    setCurrentSection(sectionId)
    setSidebarOpen(false)
    
    // Update URL without full page reload
    const newUrl = sectionId === 'dashboard' ? '/dashboard' : `/${sectionId}`
    window.history.pushState({}, '', newUrl)
    
    toast({
      title: `Switched to ${sections.find(s => s.id === sectionId)?.label}`,
      description: "All your data stays loaded and ready",
    })
  }

  // Handle task applications from any section
  const handleTaskApplication = (task: any) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleTaskApplicationSuccess = () => {
    setShowTaskModal(false)
    setSelectedTask(null)
    // Refresh current section data without navigation
    toast({
      title: "Task Application Successful!",
      description: "Your progress has been updated automatically",
    })
  }

  // Show loading if not authenticated
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="ml-2 text-lg font-bold text-gray-900">BittieTasks</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = currentSection === section.id
            
            return (
              <button
                key={section.id}
                onClick={() => navigateToSection(section.id)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-lg text-left transition-all
                  ${isActive 
                    ? `${section.bgColor} ${section.color} font-medium` 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center">
                  <Icon size={20} className={`mr-3 ${isActive ? section.color : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">{section.label}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {section.badge && (
                    <Badge className="bg-orange-100 text-orange-800 text-xs mr-2">
                      {section.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight size={16} />}
                </div>
              </button>
            )
          })}
        </nav>

        {/* User profile section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium text-gray-900">
                  {user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">Active User</div>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={signOut}
            className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm">
          <Button
            variant="ghost"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            {sections.find(s => s.id === currentSection)?.label}
          </h1>
          <div></div>
        </div>

        {/* Dynamic content area */}
        <div className="p-4 lg:p-6">
          {currentSection === 'dashboard' && <DashboardSection />}
          {currentSection === 'solo' && <SoloTasksSection />}
          {currentSection === 'community' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Tasks</h2>
              <p className="text-gray-600 mb-6">Community collaboration features coming soon...</p>
            </div>
          )}
          {currentSection === 'corporate' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Corporate Tasks</h2>
              <p className="text-gray-600 mb-6">Business partnership opportunities loading...</p>
            </div>
          )}
          {currentSection === 'barter' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Barter Exchange</h2>
              <p className="text-gray-600 mb-6">Service trading platform coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Task Application Modal */}
      {showTaskModal && selectedTask && (
        <TaskApplicationModal
          task={selectedTask}
          userId={user?.id || ''}
          isOpen={showTaskModal}
          onOpenChange={setShowTaskModal}
          onSuccess={handleTaskApplicationSuccess}
        />
      )}

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}