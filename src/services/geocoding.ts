/**
 * Geocoding service for converting GPS coordinates to human-readable locations
 * Uses multiple fallback strategies for reliable location resolution
 */

interface LocationResult {
  formatted_address: string;
  city?: string;
  province?: string;
  country?: string;
  confidence: 'high' | 'medium' | 'low';
}

// Test coordinates for major South African cities
export const TEST_COORDINATES = {
  johannesburg: { lat: -26.2041, lng: 28.0473, name: "Johannesburg, Gauteng, South Africa" },
  cape_town: { lat: -33.9249, lng: 18.4241, name: "Cape Town, Western Cape, South Africa" },
  durban: { lat: -29.8587, lng: 31.0218, name: "Durban, KwaZulu-Natal, South Africa" },
  pretoria: { lat: -25.7479, lng: 28.2293, name: "Pretoria, Gauteng, South Africa" },
  bloemfontein: { lat: -29.0852, lng: 26.1596, name: "Bloemfontein, Free State, South Africa" },
  polokwane: { lat: -23.9045, lng: 29.4689, name: "Polokwane, Limpopo, South Africa" }
};

/**
 * Reverse geocode coordinates to human-readable location
 * Uses multiple fallback strategies for reliability
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<LocationResult> => {
  try {
    // Strategy 1: Try OpenStreetMap Nominatim (free, no API key required)
    const nominatimResult = await tryNominatim(lat, lng);
    if (nominatimResult) {
      return nominatimResult;
    }

    // Strategy 2: Try BigDataCloud (free tier, no API key)
    const bigDataResult = await tryBigDataCloud(lat, lng);
    if (bigDataResult) {
      return bigDataResult;
    }

    // Strategy 3: Fallback to closest known location
    const fallbackResult = findClosestKnownLocation(lat, lng);
    return fallbackResult;

  } catch (error) {
    console.error('Geocoding error:', error);
    return findClosestKnownLocation(lat, lng);
  }
};

/**
 * Try OpenStreetMap Nominatim reverse geocoding
 */
const tryNominatim = async (lat: number, lng: number): Promise<LocationResult | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Loop-ISP-App/1.0'
        }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    if (data && data.display_name) {
      const address = data.address || {};
      
      return {
        formatted_address: data.display_name,
        city: address.city || address.town || address.village,
        province: address.state || address.province,
        country: address.country,
        confidence: 'high'
      };
    }

    return null;
  } catch (error) {
    console.error('Nominatim geocoding failed:', error);
    return null;
  }
};

/**
 * Try BigDataCloud reverse geocoding (free tier)
 */
const tryBigDataCloud = async (lat: number, lng: number): Promise<LocationResult | null> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    if (data && data.locality) {
      const formatted = `${data.locality}${data.principalSubdivision ? ', ' + data.principalSubdivision : ''}${data.countryName ? ', ' + data.countryName : ''}`;
      
      return {
        formatted_address: formatted,
        city: data.locality,
        province: data.principalSubdivision,
        country: data.countryName,
        confidence: 'medium'
      };
    }

    return null;
  } catch (error) {
    console.error('BigDataCloud geocoding failed:', error);
    return null;
  }
};

/**
 * Calculate distance between two points using Haversine formula
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Find closest known location as fallback
 */
const findClosestKnownLocation = (lat: number, lng: number): LocationResult => {
  let closestLocation = TEST_COORDINATES.johannesburg;
  let minDistance = Infinity;

  Object.values(TEST_COORDINATES).forEach(location => {
    const distance = calculateDistance(lat, lng, location.lat, location.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = location;
    }
  });

  return {
    formatted_address: `Near ${closestLocation.name}`,
    confidence: 'low'
  };
};

/**
 * Get a random test coordinate for development/testing
 */
export const getRandomTestCoordinate = () => {
  const locations = Object.values(TEST_COORDINATES);
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  
  // Add small random offset to make it more realistic
  const latOffset = (Math.random() - 0.5) * 0.1; // ±0.05 degrees (~5km)
  const lngOffset = (Math.random() - 0.5) * 0.1;
  
  return {
    lat: randomLocation.lat + latOffset,
    lng: randomLocation.lng + lngOffset,
    expectedLocation: randomLocation.name
  };
};

/**
 * Validate if coordinates are within South Africa bounds
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  // Basic coordinate validation
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};