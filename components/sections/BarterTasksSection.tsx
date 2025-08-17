'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Plus, Repeat, MessageCircle, Clock, MapPin, 
  Heart, Handshake, Star, Zap, ArrowLeftRight
} from 'lucide-react'

interface BarterTask {
  id: string
  title: string
  description: string
  category: string
  type: string
  offering: string
  seeking: string
  location: string
  time_commitment: string
  poster: string
  posted_date: string
  responses: number
}

export default function BarterTasksSection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBarter, setNewBarter] = useState({
    title: '',
    description: '',
    category: 'Services',
    offering: '',
    seeking: '',
    location: '',
    time_commitment: ''
  })

  // Sample barter exchanges
  const sampleBarters: BarterTask[] = [
    {
      id: 'barter-001',
      title: 'Graphic Design for Tutoring',
      description: 'I can create logos, flyers, business cards in exchange for math tutoring sessions',
      category: 'Services',
      type: 'barter',
      offering: 'Graphic Design (3 hours)',
      seeking: 'Math Tutoring (3 hours)',
      location: 'Downtown Area',
      time_commitment: 'Flexible scheduling',
      poster: 'Alex K.',
      posted_date: '2 days ago',
      responses: 4
    },
    {
      id: 'barter-002',
      title: 'Fresh Garden Vegetables for Pet Sitting',
      description: 'Trading fresh organic vegetables from my garden for weekend pet sitting services',
      category: 'Goods & Services',
      type: 'barter',
      offering: 'Organic Vegetables (weekly)',
      seeking: 'Pet Sitting (weekends)',
      location: 'Suburban Area',
      time_commitment: 'Weekly exchange',
      poster: 'Maria S.',
      posted_date: '1 day ago',
      responses: 7
    },
    {
      id: 'barter-003',
      title: 'Home Repairs for Cooking Lessons',
      description: 'Experienced handyman offering minor home repairs in exchange for cooking lessons',
      category: 'Skills Exchange',
      type: 'barter',
      offering: 'Home Repairs (5 hours)',
      seeking: 'Cooking Lessons (5 sessions)',
      location: 'Northside',
      time_commitment: 'Evenings/weekends',
      poster: 'David L.',
      posted_date: '3 days ago',
      responses: 2
    }
  ]

  const handleCreateBarter = () => {
    if (!newBarter.title || !newBarter.offering || !newBarter.seeking) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, what you're offering, and what you're seeking.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Barter Exchange Posted!",
      description: "Your exchange offer is now live. Neighbors can contact you directly.",
    })

    setNewBarter({
      title: '',
      description: '',
      category: 'Services',
      offering: '',
      seeking: '',
      location: '',
      time_commitment: ''
    })
    setShowCreateForm(false)
  }

  const handleContactPoster = (barter: BarterTask) => {
    toast({
      title: "Message Sent!",
      description: `You've contacted ${barter.poster} about their barter exchange.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barter Exchange</h1>
          <p className="text-gray-600">Trade services and goods with neighbors • 0% fees</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
          data-testid="button-create-barter"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Exchange
        </Button>
      </div>

      {/* Zero Fees Banner */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Handshake className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">FREE Community Barter - 0% Fees!</h3>
              <p className="text-orange-700 text-sm">
                No money changes hands, no platform fees. Pure neighbor-to-neighbor service and goods trading. 
                Built-in messaging for direct coordination.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Barter Form */}
      {showCreateForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Create Barter Exchange</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="barter-title">Exchange Title *</Label>
              <Input
                id="barter-title"
                value={newBarter.title}
                onChange={(e) => setNewBarter({...newBarter, title: e.target.value})}
                placeholder="Graphic design for tutoring, vegetables for pet sitting..."
                data-testid="input-barter-title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barter-offering">What I'm Offering *</Label>
                <Input
                  id="barter-offering"
                  value={newBarter.offering}
                  onChange={(e) => setNewBarter({...newBarter, offering: e.target.value})}
                  placeholder="Graphic design work, fresh vegetables..."
                  data-testid="input-barter-offering"
                />
              </div>
              <div>
                <Label htmlFor="barter-seeking">What I'm Seeking *</Label>
                <Input
                  id="barter-seeking"
                  value={newBarter.seeking}
                  onChange={(e) => setNewBarter({...newBarter, seeking: e.target.value})}
                  placeholder="Math tutoring, pet sitting..."
                  data-testid="input-barter-seeking"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="barter-description">Description</Label>
              <Textarea
                id="barter-description"
                value={newBarter.description}
                onChange={(e) => setNewBarter({...newBarter, description: e.target.value})}
                placeholder="Provide details about what you're offering and what you need..."
                rows={3}
                data-testid="textarea-barter-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barter-location">Location/Area</Label>
                <Input
                  id="barter-location"
                  value={newBarter.location}
                  onChange={(e) => setNewBarter({...newBarter, location: e.target.value})}
                  placeholder="Downtown, Northside..."
                  data-testid="input-barter-location"
                />
              </div>
              <div>
                <Label htmlFor="barter-time">Time Availability</Label>
                <Input
                  id="barter-time"
                  value={newBarter.time_commitment}
                  onChange={(e) => setNewBarter({...newBarter, time_commitment: e.target.value})}
                  placeholder="Evenings, weekends, flexible..."
                  data-testid="input-barter-time"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleCreateBarter}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                data-testid="button-submit-barter"
              >
                Post Exchange
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                data-testid="button-cancel-barter"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Exchanges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleBarters.map((barter) => (
          <Card key={barter.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  0% Fees
                </Badge>
                <div className="text-right">
                  <div className="font-bold text-lg text-orange-600">FREE</div>
                  <div className="text-xs text-gray-500">Barter Only</div>
                </div>
              </div>
              <CardTitle className="text-lg">{barter.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{barter.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <ArrowLeftRight className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-700">Offering:</div>
                    <div className="text-sm text-gray-600">{barter.offering}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <ArrowLeftRight className="w-3 h-3 text-blue-600 rotate-180" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-700">Seeking:</div>
                    <div className="text-sm text-gray-600">{barter.seeking}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{barter.time_commitment}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{barter.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Posted by {barter.poster}</span>
                <div className="flex items-center text-gray-500">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  <span>{barter.responses}</span>
                </div>
              </div>

              <Button
                onClick={() => handleContactPoster(barter)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                data-testid={`button-contact-${barter.id}`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact for Exchange
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Zero Fees</h3>
            <p className="text-sm text-gray-600">No money involved, no platform fees - pure community exchange</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <Repeat className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Skills & Services</h3>
            <p className="text-sm text-gray-600">Trade talents, services, and goods directly with neighbors</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Direct Connection</h3>
            <p className="text-sm text-gray-600">Built-in messaging to coordinate exchanges easily</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}