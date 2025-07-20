/*
  # Create Loop ISP Database Tables
  
  This migration creates all necessary tables for the Loop ISP WhatsApp onboarding system.
  
  ## Tables Created:
  1. packages - Internet packages with pricing and features
  2. coverage_areas - Geographic coverage zones
  3. customers - Customer data and journey tracking
  4. customer_interactions - Chat interaction logs
  5. customer_journey_events - Journey stage changes
  6. customer_package_selections - Package selection history
  
  ## Features:
  - Row Level Security enabled on all tables
  - Comprehensive indexes for performance
  - Sample data for testing
  - All records tagged with system_input_process = 'bolt'
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'pending', 'cancelled', 'suspended', 'churned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE journey_stage AS ENUM ('awareness', 'consideration', 'decision', 'retention', 'advocacy', 'churned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE language_code AS ENUM ('en', 'af', 'zu');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interaction_type AS ENUM ('message', 'quick_reply', 'location_share', 'package_selection', 'consent', 'coverage_check');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PACKAGES TABLE
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_code text UNIQUE NOT NULL,
  name text NOT NULL,
  speed text NOT NULL,
  price_per_day numeric(10,2) NOT NULL,
  price_display text NOT NULL,
  description text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. COVERAGE AREAS TABLE
CREATE TABLE IF NOT EXISTS coverage_areas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_name text NOT NULL,
  area_type text DEFAULT 'general',
  coordinates jsonb,
  center_lat numeric(10,8),
  center_lng numeric(11,8),
  radius_km numeric(8,2),
  is_active boolean DEFAULT true,
  coverage_quality text DEFAULT 'good',
  notes text,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone_number text NOT NULL,
  preferred_language language_code NOT NULL DEFAULT 'en',
  gps_coordinates text,
  manual_location text,
  coverage_available boolean DEFAULT false,
  coverage_area_id uuid REFERENCES coverage_areas(id),
  status customer_status DEFAULT 'pending',
  current_journey_stage journey_stage DEFAULT 'awareness',
  selected_package_id uuid REFERENCES packages(id),
  selected_package_code text,
  consent_given boolean DEFAULT false,
  consent_timestamp timestamptz,
  first_contact_date timestamptz DEFAULT now(),
  last_interaction_date timestamptz DEFAULT now(),
  conversion_date timestamptz,
  churn_date timestamptz,
  churn_reason text,
  lifetime_value numeric(12,2) DEFAULT 0,
  acquisition_source text DEFAULT 'whatsapp_onboarding',
  referral_code text,
  notes text,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. CUSTOMER INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS customer_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  session_id text,
  interaction_type interaction_type NOT NULL,
  message_text text,
  bot_response text,
  quick_reply_selected text,
  metadata jsonb DEFAULT '{}',
  language_used language_code,
  timestamp timestamptz DEFAULT now(),
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now()
);

-- 5. CUSTOMER JOURNEY EVENTS TABLE
CREATE TABLE IF NOT EXISTS customer_journey_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  from_stage journey_stage,
  to_stage journey_stage NOT NULL,
  event_trigger text,
  event_data jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now()
);

-- 6. CUSTOMER PACKAGE SELECTIONS TABLE
CREATE TABLE IF NOT EXISTS customer_package_selections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  package_id uuid REFERENCES packages(id),
  package_code text NOT NULL,
  selection_timestamp timestamptz DEFAULT now(),
  is_final_selection boolean DEFAULT false,
  selection_context text,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now()
);

-- Insert sample packages (only if they don't exist)
INSERT INTO packages (package_code, name, speed, price_per_day, price_display, description, features, is_popular, sort_order)
SELECT 'basic', 'Farm Connect', '10 Mbps', 15.00, 'R15/day', 'Perfect for WhatsApp, email, and basic browsing', 
       '["WhatsApp & social media", "Email & basic browsing", "Weather updates", "Banking apps", "No contract required"]'::jsonb, 
       false, 1
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE package_code = 'basic');

INSERT INTO packages (package_code, name, speed, price_per_day, price_display, description, features, is_popular, sort_order)
SELECT 'standard', 'Family Plus', '25 Mbps', 25.00, 'R25/day', 'Great for families - streaming and video calls', 
       '["Everything in Farm Connect", "Video calls with family", "YouTube & Netflix", "Multiple devices", "Priority support"]'::jsonb, 
       true, 2
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE package_code = 'standard');

INSERT INTO packages (package_code, name, speed, price_per_day, price_display, description, features, is_popular, sort_order)
SELECT 'premium', 'Business Pro', '50 Mbps', 45.00, 'R45/day', 'For small businesses and heavy users', 
       '["Everything in Family Plus", "Fast file uploads", "Video conferencing", "Cloud backup", "24/7 business support"]'::jsonb, 
       false, 3
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE package_code = 'premium');

-- Insert sample coverage areas (only if they don't exist)
INSERT INTO coverage_areas (area_name, area_type, center_lat, center_lng, radius_km, coverage_quality)
SELECT 'Johannesburg Metro', 'city', -26.2041, 28.0473, 50, 'excellent'
WHERE NOT EXISTS (SELECT 1 FROM coverage_areas WHERE area_name = 'Johannesburg Metro');

INSERT INTO coverage_areas (area_name, area_type, center_lat, center_lng, radius_km, coverage_quality)
SELECT 'Cape Town Metro', 'city', -33.9249, 18.4241, 45, 'excellent'
WHERE NOT EXISTS (SELECT 1 FROM coverage_areas WHERE area_name = 'Cape Town Metro');

INSERT INTO coverage_areas (area_name, area_type, center_lat, center_lng, radius_km, coverage_quality)
SELECT 'Durban Metro', 'city', -29.8587, 31.0218, 40, 'excellent'
WHERE NOT EXISTS (SELECT 1 FROM coverage_areas WHERE area_name = 'Durban Metro');

INSERT INTO coverage_areas (area_name, area_type, center_lat, center_lng, radius_km, coverage_quality)
SELECT 'Pretoria', 'city', -25.7479, 28.2293, 35, 'good'
WHERE NOT EXISTS (SELECT 1 FROM coverage_areas WHERE area_name = 'Pretoria');

INSERT INTO coverage_areas (area_name, area_type, center_lat, center_lng, radius_km, coverage_quality)
SELECT 'Rural Western Cape', 'rural', -33.5, 19.0, 100, 'fair'
WHERE NOT EXISTS (SELECT 1 FROM coverage_areas WHERE area_name = 'Rural Western Cape');

INSERT INTO coverage_areas (area_name, area_type, center_lat, center_lng, radius_km, coverage_quality)
SELECT 'Rural KwaZulu-Natal', 'rural', -29.0, 30.0, 120, 'good'
WHERE NOT EXISTS (SELECT 1 FROM coverage_areas WHERE area_name = 'Rural KwaZulu-Natal');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_journey_stage ON customers(current_journey_stage);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON customer_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_sort_order ON packages(sort_order);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_package_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_areas ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Public can read active packages" ON packages;
CREATE POLICY "Public can read active packages"
  ON packages
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage packages" ON packages;
CREATE POLICY "Authenticated users can manage packages"
  ON packages
  FOR ALL
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can read active coverage areas" ON coverage_areas;
CREATE POLICY "Public can read active coverage areas"
  ON coverage_areas
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage coverage areas" ON coverage_areas;
CREATE POLICY "Authenticated users can manage coverage areas"
  ON coverage_areas
  FOR ALL
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;
CREATE POLICY "Authenticated users can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage customer interactions" ON customer_interactions;
CREATE POLICY "Authenticated users can manage customer interactions"
  ON customer_interactions
  FOR ALL
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage journey events" ON customer_journey_events;
CREATE POLICY "Authenticated users can manage journey events"
  ON customer_journey_events
  FOR ALL
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage package selections" ON customer_package_selections;
CREATE POLICY "Authenticated users can manage package selections"
  ON customer_package_selections
  FOR ALL
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coverage_areas_updated_at ON coverage_areas;
CREATE TRIGGER update_coverage_areas_updated_at BEFORE UPDATE ON coverage_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();