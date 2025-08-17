// Geocoding utilities for location tracking and distance calculations

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  zipCode: string;
  city: string;
  state: string;
  coordinates?: Coordinates;
}

// Simple zip code to coordinates mapping for common US cities
// In production, this would use a proper geocoding API like Google Maps API
const ZIP_COORDINATES: Record<string, Coordinates> = {
  // San Francisco Bay Area
  '94102': { lat: 37.7749, lng: -122.4194 },
  '94103': { lat: 37.7699, lng: -122.4103 },
  '94104': { lat: 37.7912, lng: -122.4013 },
  '94105': { lat: 37.7849, lng: -122.3973 },
  '94107': { lat: 37.7563, lng: -122.3997 },
  '94110': { lat: 37.7485, lng: -122.4147 },
  '94114': { lat: 37.7584, lng: -122.4348 },
  '94115': { lat: 37.7886, lng: -122.4324 },
  '94118': { lat: 37.7793, lng: -122.4567 },
  '94122': { lat: 37.7594, lng: -122.4896 },
  '94123': { lat: 37.7989, lng: -122.4392 },
  '94158': { lat: 37.7706, lng: -122.3896 },
  
  // Oakland
  '94601': { lat: 37.7903, lng: -122.2457 },
  '94602': { lat: 37.7546, lng: -122.2279 },
  '94603': { lat: 37.7217, lng: -122.1705 },
  '94604': { lat: 37.7347, lng: -122.2108 },
  '94605': { lat: 37.7373, lng: -122.1565 },
  '94606': { lat: 37.7613, lng: -122.2022 },
  '94607': { lat: 37.7775, lng: -122.2647 },
  '94608': { lat: 37.8318, lng: -122.2732 },
  '94609': { lat: 37.8270, lng: -122.2555 },
  '94610': { lat: 37.8044, lng: -122.2688 },
  
  // Berkeley
  '94704': { lat: 37.8715, lng: -122.2730 },
  '94705': { lat: 37.8544, lng: -122.2654 },
  '94707': { lat: 37.8787, lng: -122.2655 },
  '94708': { lat: 37.8836, lng: -122.2839 },
  
  // Common zip codes in other major cities
  '10001': { lat: 40.7506, lng: -73.9972 }, // NYC
  '90210': { lat: 34.0901, lng: -118.4065 }, // Beverly Hills
  '60601': { lat: 41.8825, lng: -87.6298 }, // Chicago
  '33101': { lat: 25.7839, lng: -80.2102 }, // Miami
  '98101': { lat: 47.6097, lng: -122.3331 }, // Seattle
  '02101': { lat: 42.3584, lng: -71.0598 }, // Boston
  '20001': { lat: 38.9072, lng: -77.0369 }, // Washington DC
  '30301': { lat: 33.7490, lng: -84.3880 }, // Atlanta
  '85001': { lat: 33.4484, lng: -112.0740 }, // Phoenix
  '19101': { lat: 39.9526, lng: -75.1652 }, // Philadelphia
}

/**
 * Get coordinates for a zipcode using local mapping
 * In production, this would call a proper geocoding API
 */
export function getCoordinatesFromZipCode(zipCode: string): Coordinates | null {
  const coordinates = ZIP_COORDINATES[zipCode]
  if (coordinates) {
    return coordinates
  }
  
  // For unknown zip codes, return null - a real geocoding API would be used here
  console.warn(`Unknown zip code: ${zipCode}. Add to ZIP_COORDINATES mapping or use real geocoding API.`)
  return null
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959; // Earth's radius in miles
  
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in miles
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Parse location data from form inputs and get coordinates
 */
export function processLocationData(
  location: string,
  city: string,
  state: string,
  zipCode: string,
  radiusMiles: number = 25
): {
  location: string;
  zipCode: string;
  city: string;
  state: string;
  coordinates: string | null;
  radiusMiles: number;
} {
  // Create full location string for display
  const fullLocation = [location, city, state, zipCode]
    .filter(Boolean)
    .join(', ')

  // Get coordinates from zip code
  const coords = getCoordinatesFromZipCode(zipCode)
  const coordinatesString = coords ? `${coords.lat},${coords.lng}` : null

  return {
    location: fullLocation,
    zipCode,
    city,
    state,
    coordinates: coordinatesString,
    radiusMiles
  }
}

/**
 * Get user's location from their profile or default to SF
 * This would eventually use browser geolocation or user profile data
 */
export function getUserCoordinates(): Coordinates {
  // For now, default to San Francisco
  // In production, get from user profile or browser geolocation
  return { lat: 37.7749, lng: -122.4194 }
}

/**
 * Calculate distance from user to a task
 */
export function calculateDistanceFromUser(taskCoordinates: string): number {
  const userCoords = getUserCoordinates()
  
  if (!taskCoordinates) {
    return 999 // Unknown distance for tasks without coordinates
  }
  
  const [lat, lng] = taskCoordinates.split(',').map(Number)
  if (isNaN(lat) || isNaN(lng)) {
    return 999
  }
  
  const taskCoords = { lat, lng }
  return calculateDistance(userCoords, taskCoords)
}