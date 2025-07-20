import { createClient } from '@supabase/supabase-js';
import { ServiceProvider } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types
export interface Package {
  id: string;
  package_code: string;
  name: string;
  speed: string;
  price: number;
  price_display: string;
  description: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface CoverageArea {
  id: string;
  area_name: string;
  area_type: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  coverage_quality: string;
  is_active: boolean;
}

export interface CustomerData {
  name: string;
  phone_number: string;
  preferred_language: 'en' | 'af' | 'zu';
  gps_coordinates?: string;
  gps_location?: string;
  manual_location?: string;
  coverage_available: boolean;
  coverage_area_id?: string;
  status: 'active' | 'inactive' | 'pending' | 'cancelled' | 'suspended' | 'churned';
  current_journey_stage: 'awareness' | 'consideration' | 'decision' | 'retention' | 'advocacy' | 'churned';
  selected_package_id?: string;
  selected_package_code?: string;
  consent_given: boolean;
  consent_timestamp?: string;
  selected_service_provider_id?: string;
  acquisition_source?: string;
  system_input_process?: string;
}

export interface CustomerInteraction {
  customer_id: string;
  session_id: string;
  interaction_type: 'message' | 'quick_reply' | 'location_share' | 'package_selection' | 'consent' | 'coverage_check';
  message_text?: string;
  bot_response?: string;
  quick_reply_selected?: string;
  metadata?: any;
  language_used: 'en' | 'af' | 'zu';
  system_input_process?: string;
}

// Package functions
export const getActivePackages = async (): Promise<Package[]> => {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }

  return data || [];
};

// Service provider functions
export const getServiceProvidersForCoverageArea = async (coverageAreaId: string): Promise<ServiceProvider[]> => {
  try {
    const { data, error } = await supabase
      .from('coverage_area_service_providers')
      .select(`
        service_providers (
          id,
          name,
          description
        )
      `)
      .eq('coverage_area_id', coverageAreaId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching service providers:', error);
      throw error;
    }

    // Extract service providers from the nested structure
    const serviceProviders = data?.map(item => item.service_providers).filter(Boolean) || [];
    return serviceProviders as ServiceProvider[];
  } catch (error) {
    console.error('Error fetching service providers for coverage area:', error);
    // Return fallback providers for demo purposes
    return [
      {
        id: 'openserve',
        name: 'Openserve',
        description: 'Telkom\'s fibre network with wide coverage across South Africa'
      },
      {
        id: 'vumatel',
        name: 'Vumatel',
        description: 'Premium fibre infrastructure focused on residential areas'
      }
    ];
  }
};

// Coverage functions
export const checkCoverage = async (coordinates?: string, location?: string): Promise<{ available: boolean; area?: CoverageArea }> => {
  try {
    // If we have GPS coordinates, check against coverage areas
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(Number);
      
      const { data: coverageAreas, error } = await supabase
        .from('coverage_areas')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error checking coverage:', error);
        return { available: false };
      }

      // Simple distance-based coverage check
      for (const area of coverageAreas || []) {
        if (area.center_lat && area.center_lng && area.radius_km) {
          const distance = calculateDistance(lat, lng, area.center_lat, area.center_lng);
          if (distance <= area.radius_km) {
            return { available: true, area };
          }
        }
      }
    }

    // If we have manual location, do a simple text search
    if (location) {
      const { data: coverageAreas, error } = await supabase
        .from('coverage_areas')
        .select('*')
        .eq('is_active', true)
        .ilike('area_name', `%${location}%`);

      if (error) {
        console.error('Error checking coverage by location:', error);
        return { available: false };
      }

      if (coverageAreas && coverageAreas.length > 0) {
        return { available: true, area: coverageAreas[0] };
      }
    }

    // Default: 85% chance of coverage for demo purposes
    const isAvailable = Math.random() > 0.15;
    return { available: isAvailable };
  } catch (error) {
    console.error('Coverage check error:', error);
    return { available: false };
  }
};

// New function to find coverage area by coordinates
export const findCoverageAreaByCoordinates = async (lat: number, lng: number): Promise<{ found: boolean; area?: CoverageArea; distance?: number }> => {
  try {
    const { data: coverageAreas, error } = await supabase
      .from('coverage_areas')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching coverage areas:', error);
      return { found: false };
    }

    // Find the closest coverage area within radius
    let closestArea: CoverageArea | null = null;
    let closestDistance = Infinity;

    for (const area of coverageAreas || []) {
      if (area.center_lat && area.center_lng && area.radius_km) {
        const distance = calculateDistance(lat, lng, area.center_lat, area.center_lng);
        
        // Check if within radius and closer than previous matches
        if (distance <= area.radius_km && distance < closestDistance) {
          closestArea = area;
          closestDistance = distance;
        }
      }
    }

    if (closestArea) {
      return { 
        found: true, 
        area: closestArea, 
        distance: closestDistance 
      };
    }

    return { found: false };
  } catch (error) {
    console.error('Error finding coverage area:', error);
    return { found: false };
  }
};
// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Customer functions
export const createCustomer = async (customerData: CustomerData): Promise<any> => {
  try {
    // Set default values
    const dataToInsert: any = {
      name: customerData.name,
      phone_number: customerData.phone_number,
      preferred_language: customerData.preferred_language,
      gps_coordinates: customerData.gps_coordinates,
      manual_location: customerData.manual_location,
      coverage_available: customerData.coverage_available,
      coverage_area_id: customerData.coverage_area_id,
      status: customerData.status,
      current_journey_stage: customerData.current_journey_stage,
      selected_package_id: customerData.selected_package_id,
      selected_package_code: customerData.selected_package_code,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      system_input_process: 'bolt',
      acquisition_source: 'whatsapp_onboarding'
    };

    // Only include gps_location if it exists in the data
    if (customerData.gps_location) {
      dataToInsert.gps_location = customerData.gps_location;
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    console.log('Customer created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Interaction logging
export const logInteraction = async (interaction: CustomerInteraction): Promise<void> => {
  try {
    const dataToInsert = {
      ...interaction,
      system_input_process: 'bolt'
    };

    const { error } = await supabase
      .from('customer_interactions')
      .insert(dataToInsert);

    if (error) {
      console.error('Error logging interaction:', error);
    }
  } catch (error) {
    console.error('Error logging interaction:', error);
  }
};

// Journey tracking
export const trackJourneyStage = async (
  customerId: string, 
  fromStage: string | null, 
  toStage: string, 
  trigger: string,
  eventData?: any
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('customer_journey_events')
      .insert({
        customer_id: customerId,
        from_stage: fromStage,
        to_stage: toStage,
        event_trigger: trigger,
        event_data: eventData || {},
        system_input_process: 'bolt'
      });

    if (error) {
      console.error('Error tracking journey stage:', error);
    }
  } catch (error) {
    console.error('Error tracking journey stage:', error);
  }
};

// Package selection tracking
export const trackPackageSelection = async (
  customerId: string,
  packageId: string,
  packageCode: string,
  isFinal: boolean = false,
  context: string = 'initial'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('customer_package_selections')
      .insert({
        customer_id: customerId,
        package_id: packageId,
        package_code: packageCode,
        is_final_selection: isFinal,
        selection_context: context,
        system_input_process: 'bolt'
      });

    if (error) {
      console.error('Error tracking package selection:', error);
    }
  } catch (error) {
    console.error('Error tracking package selection:', error);
  }
};