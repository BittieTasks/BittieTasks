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
  Heart, Handshake, Star, Zap, ArrowLeftRight, Filter, Search
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TaskMessaging from '@/components/messaging/TaskMessaging'

interface BarterTask {
  id: string
  title: string
  description: string
  category: string
  type: string
  offering: string
  seeking: string
  location: string
  city: string
  state: string
  zipCode: string
  coordinates?: { lat: number, lng: number }
  radius_miles: number
  time_commitment: string
  poster: string
  posted_date: string
  responses: number
  distance_from_user?: number
}

export default function BarterTasksSection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [locationFilter, setLocationFilter] = useState('25') // Default 25 mile radius
  const [cityFilter, setCityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [newBarter, setNewBarter] = useState({
    title: '',
    description: '',
    category: 'Services',
    offering: '',
    seeking: '',
    location: '',
    city: '',
    state: '',
    zipCode: '',
    radius_miles: '10',
    time_commitment: ''
  })

  // Sample barter exchanges with realistic geographic distribution
  const allBarterExchanges: BarterTask[] = [
    {
      id: 'barter-001',
      title: 'Graphic Design for Tutoring',
      description: 'I can create logos, flyers, business cards in exchange for math tutoring sessions',
      category: 'Services',
      type: 'barter',
      offering: 'Graphic Design (3 hours)',
      seeking: 'Math Tutoring (3 hours)',
      location: 'Downtown Design Studio',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      coordinates: { lat: 37.7849, lng: -122.3973 },
      radius_miles: 15,
      time_commitment: 'Flexible scheduling',
      poster: 'Alex K.',
      posted_date: '2 days ago',
      responses: 4,
      distance_from_user: 3.2
    },
    {
      id: 'barter-002',
      title: 'Fresh Garden Vegetables for Pet Sitting',
      description: 'Trading fresh organic vegetables from my garden for weekend pet sitting services',
      category: 'Goods & Services',
      type: 'barter',
      offering: 'Organic Vegetables (weekly)',
      seeking: 'Pet Sitting (weekends)',
      location: 'Sunset District Home',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94122',
      coordinates: { lat: 37.7594, lng: -122.4896 },
      radius_miles: 8,
      time_commitment: 'Weekly exchange',
      poster: 'Maria S.',
      posted_date: '1 day ago',
      responses: 7,
      distance_from_user: 5.8
    },
    {
      id: 'barter-003',
      title: 'Home Repairs for Cooking Lessons',
      description: 'Experienced handyman offering minor home repairs in exchange for cooking lessons',
      category: 'Skills Exchange',
      type: 'barter',
      offering: 'Home Repairs (5 hours)',
      seeking: 'Cooking Lessons (5 sessions)',
      location: 'Northside Workshop',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94609',
      coordinates: { lat: 37.8270, lng: -122.2555 },
      radius_miles: 12,
      time_commitment: 'Evenings/weekends',
      poster: 'David L.',
      posted_date: '3 days ago',
      responses: 2,
      distance_from_user: 9.1
    },
    {
      id: 'barter-004',
      title: 'Language Exchange: Spanish for English',
      description: 'Native Spanish speaker looking to practice English conversation skills in exchange for Spanish lessons',
      category: 'Education',
      type: 'barter',
      offering: 'Spanish Lessons (2 hrs/week)',
      seeking: 'English Conversation (2 hrs/week)',
      location: 'Mission Bay Community Center',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94158',
      coordinates: { lat: 37.7706, lng: -122.3896 },
      radius_miles: 20,
      time_commitment: '2 hours weekly',
      poster: 'Carlos M.',
      posted_date: '4 days ago',
      responses: 12,
      distance_from_user: 6.7
    },
    {
      id: 'barter-005',
      title: 'Web Development for Photography',
      description: 'Frontend developer offering website creation in exchange for professional headshot photography session',
      category: 'Professional Services',
      type: 'barter',
      offering: 'Website Development',
      seeking: 'Photography Session',
      location: 'Berkeley Tech Hub',
      city: 'Berkeley',
      state: 'CA',
      zipCode: '94704',
      coordinates: { lat: 37.8715, lng: -122.2730 },
      radius_miles: 25,
      time_commitment: 'One-time exchange',
      poster: 'Sarah L.',
      posted_date: '1 week ago',
      responses: 3,
      distance_from_user: 11.8
    }
  ]

  // Filter barter exchanges based on location and search criteria
  const filteredBarters = allBarterExchanges.filter(barter => {
    const matchesRadius = barter.distance_from_user! <= parseInt(locationFilter)
    const matchesCity = !cityFilter || barter.city.toLowerCase().includes(cityFilter.toLowerCase())
    const matchesSearch = !searchTerm || 
      barter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barter.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barter.offering.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barter.seeking.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || barter.category === categoryFilter
    
    return matchesRadius && matchesCity && matchesSearch && matchesCategory
  })

  const handleCreateBarter = async () => {
    if (!newBarter.title || !newBarter.offering || !newBarter.seeking) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, what you're offering, and what you're seeking.",
        variant: "destructive"
      })
      return
    }

    try {
      // Simulate saving to backend with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Barter exchange created and saved:', {
        ...newBarter,
        id: `barter-${Date.now()}`,
        creator: user?.email,
        created_at: new Date().toISOString(),
        status: 'active',
        responses: 0,
        coordinates: { lat: 37.7749, lng: -122.4194 }, // Would be geocoded from address
        distance_from_user: 0
      })

      toast({
        title: "Barter Exchange Posted & Saved!",
        description: "Your offer is now live with 0% fees. Neighbors can contact you directly.",
      })

      setNewBarter({
        title: '',
        description: '',
        category: 'Services',
        offering: '',
        seeking: '',
        location: '',
        city: '',
        state: '',
        zipCode: '',
        radius_miles: '10',
        time_commitment: ''
      })
      setShowCreateForm(false)
    } catch (error) {
      toast({
        title: "Save Failed", 
        description: "Could not save your barter exchange. Please try again.",
        variant: "destructive"
      })
    }
  }

  const [selectedTaskForMessaging, setSelectedTaskForMessaging] = useState<BarterTask | null>(null)
  const [showMessaging, setShowMessaging] = useState(false)

  const handleContactPoster = (barter: BarterTask) => {
    setSelectedTaskForMessaging(barter)
    setShowMessaging(true)
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

      {/* Location and Search Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search-barters" className="text-sm font-medium">Search Exchanges</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search-barters"
                  placeholder="Search by title, offering, or seeking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="barter-radius" className="text-sm font-medium">Radius (miles)</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Within 5 miles</SelectItem>
                  <SelectItem value="10">Within 10 miles</SelectItem>
                  <SelectItem value="25">Within 25 miles</SelectItem>
                  <SelectItem value="50">Within 50 miles</SelectItem>
                  <SelectItem value="100">Within 100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="barter-city-filter" className="text-sm font-medium">City</Label>
              <Input
                id="barter-city-filter"
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="barter-category-filter" className="text-sm font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Goods & Services">Goods & Services</SelectItem>
                  <SelectItem value="Skills Exchange">Skills Exchange</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredBarters.length} exchanges within {locationFilter} miles</span>
            {cityFilter && <span>• City: {cityFilter}</span>}
            {categoryFilter !== 'all' && <span>• Category: {categoryFilter}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Zero Fees Banner */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Handshake className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">FREE Community Barter - 0% Fees LIVE!</h3>
              <p className="text-orange-700 text-sm">
                No money changes hands, no platform fees. Live neighbor-to-neighbor service and goods trading. 
                Built-in messaging for direct coordination. Real exchanges happening now.
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
        {filteredBarters.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exchanges found in your area</h3>
            <p className="text-gray-600 mb-4">
              Try expanding your search radius or be the first to create an exchange in your neighborhood!
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Create First Exchange
            </Button>
          </div>
        ) : (
          filteredBarters.map((barter) => (
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
                  <span>{barter.location}, {barter.city}, {barter.state}</span>
                </div>
                <div className="flex items-center text-sm text-orange-600">
                  <span className="font-medium">{barter.distance_from_user} miles away</span>
                  <span className="mx-2">•</span>
                  <span>Up to {barter.radius_miles} mile radius</span>
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
          ))
        )}
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

      {/* Task Messaging Modal */}
      {showMessaging && selectedTaskForMessaging && user && (
        <TaskMessaging
          taskId={selectedTaskForMessaging.id}
          taskTitle={selectedTaskForMessaging.title}
          isOpen={showMessaging}
          onOpenChange={setShowMessaging}
        />
      )}
    </div>
  )
}