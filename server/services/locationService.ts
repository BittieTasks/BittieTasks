// Location Service for Geographic Task Matching and Verification
// Helps match users with nearby tasks and verify task locations

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface NearbySearchResult {
  taskId: string;
  distance: number; // in miles
  title: string;
  location: LocationData;
}

interface GeolocationResult {
  success: boolean;
  location?: LocationData;
  error?: string;
}

class LocationService {
  private readonly EARTH_RADIUS_MILES = 3959;
  private readonly DEFAULT_SEARCH_RADIUS = 25; // miles

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_MILES * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get user's location from IP address (basic implementation)
  async getLocationFromIP(ipAddress: string): Promise<GeolocationResult> {
    try {
      // Skip localhost/development IPs
      if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.')) {
        return {
          success: true,
          location: {
            latitude: 37.7749, // San Francisco default
            longitude: -122.4194,
            city: 'San Francisco',
            state: 'CA',
            country: 'US'
          }
        };
      }

      // In production, would use service like IPGeolocation or MaxMind
      console.log(`🌍 Location lookup requested for IP: ${ipAddress}`);
      
      // Mock location data for development
      return {
        success: true,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          address: 'New York, NY'
        }
      };
    } catch (error) {
      console.error('IP geolocation error:', error);
      return {
        success: false,
        error: 'Failed to determine location'
      };
    }
  }

  // Geocode an address to coordinates
  async geocodeAddress(address: string): Promise<GeolocationResult> {
    try {
      // In production, would integrate with Google Maps Geocoding API
      console.log(`🗺️  Geocoding address: ${address}`);
      
      // Mock geocoding for development
      const mockLocations: Record<string, LocationData> = {
        'san francisco': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', state: 'CA' },
        'new york': { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY' },
        'los angeles': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA' },
        'chicago': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL' },
        'miami': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL' }
      };

      const key = address.toLowerCase();
      const location = Object.keys(mockLocations).find(city => key.includes(city));
      
      if (location) {
        return {
          success: true,
          location: mockLocations[location]
        };
      }

      return {
        success: false,
        error: 'Address not found'
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: 'Geocoding failed'
      };
    }
  }

  // Find tasks within a specified radius
  async findNearbyTasks(
    userLocation: LocationData, 
    radiusMiles: number = this.DEFAULT_SEARCH_RADIUS,
    limit: number = 20
  ): Promise<NearbySearchResult[]> {
    try {
      // In production, would query database with spatial indexes
      const mockTasks = [
        {
          taskId: '1',
          title: 'Help with grocery shopping',
          location: { latitude: 37.7849, longitude: -122.4094 }
        },
        {
          taskId: '2',
          title: 'Walk my dog while I work',
          location: { latitude: 37.7649, longitude: -122.4294 }
        },
        {
          taskId: '3',
          title: 'Pick up kids from school',
          location: { latitude: 37.7549, longitude: -122.4394 }
        },
        {
          taskId: '4',
          title: 'Garden maintenance help',
          location: { latitude: 37.7949, longitude: -122.3994 }
        },
        {
          taskId: '5',
          title: 'Home cleaning assistance',
          location: { latitude: 37.7449, longitude: -122.4494 }
        }
      ];

      const nearbyTasks: NearbySearchResult[] = [];

      for (const task of mockTasks) {
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          task.location.latitude,
          task.location.longitude
        );

        if (distance <= radiusMiles) {
          nearbyTasks.push({
            taskId: task.taskId,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            title: task.title,
            location: task.location
          });
        }
      }

      // Sort by distance and limit results
      return nearbyTasks
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    } catch (error) {
      console.error('Nearby tasks search error:', error);
      return [];
    }
  }

  // Validate that a task location is reasonable for the user
  isLocationReasonable(userLocation: LocationData, taskLocation: LocationData): {
    valid: boolean;
    distance: number;
    reason?: string;
  } {
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      taskLocation.latitude,
      taskLocation.longitude
    );

    // Check if distance is reasonable (within 50 miles)
    if (distance > 50) {
      return {
        valid: false,
        distance,
        reason: 'Task is too far from your location'
      };
    }

    // Check if same city/metro area (within 25 miles)
    if (distance > 25) {
      return {
        valid: true,
        distance,
        reason: 'Task is outside your immediate area but still reachable'
      };
    }

    return {
      valid: true,
      distance
    };
  }

  // Get popular areas for task creation
  getPopularAreas(): Array<{ name: string; location: LocationData; taskCount: number }> {
    return [
      {
        name: 'Downtown',
        location: { latitude: 37.7849, longitude: -122.4094 },
        taskCount: 45
      },
      {
        name: 'Mission District',
        location: { latitude: 37.7599, longitude: -122.4148 },
        taskCount: 38
      },
      {
        name: 'Sunset',
        location: { latitude: 37.7449, longitude: -122.4794 },
        taskCount: 29
      },
      {
        name: 'Richmond',
        location: { latitude: 37.7799, longitude: -122.4699 },
        taskCount: 22
      },
      {
        name: 'Marina',
        location: { latitude: 37.7999, longitude: -122.4399 },
        taskCount: 31
      }
    ];
  }

  // Format location for display
  formatLocationDisplay(location: LocationData): string {
    const parts = [];
    
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    
    return parts.join(', ') || 'Unknown Location';
  }

  // Check if location services are available
  isLocationServiceAvailable(): boolean {
    // In production, would check if Google Maps API key is configured
    return true;
  }

  // Get timezone for a location
  getTimezoneForLocation(location: LocationData): string {
    // Simplified timezone mapping
    if (!location.state) return 'America/Los_Angeles';
    
    const timezoneMap: Record<string, string> = {
      'CA': 'America/Los_Angeles',
      'NY': 'America/New_York',
      'TX': 'America/Chicago',
      'FL': 'America/New_York',
      'IL': 'America/Chicago',
      'WA': 'America/Los_Angeles',
      'OR': 'America/Los_Angeles'
    };

    return timezoneMap[location.state] || 'America/Los_Angeles';
  }
}

export const locationService = new LocationService();