/*
  # Complete Loop ISP Database Schema

  1. Custom Types
    - `customer_status` enum for customer account states
    - `journey_stage` enum for customer lifecycle tracking
    - `language_code` enum for multi-language support
    - `interaction_type` enum for chat interaction classification

  2. Core Tables
    - `packages` - Internet service packages with pricing and features
    - `coverage_areas` - Geographic service coverage regions
    - `service_providers` - Network infrastructure providers
    - `customers` - Main customer records with journey tracking

  3. Activity Tables
    - `customer_interactions` - Complete chat history and user actions
    - `customer_journey_events` - Customer lifecycle stage transitions
    - `customer_package_selections` - Package selection history
    - `coverage_area_service_providers` - Many-to-many relationship table

  4. Security
    - Enable RLS on all tables
    - Public access for read operations and customer creation
    - Authenticated access for management operations

  5. Performance
    - Indexes on frequently queried columns
    - Foreign key constraints for data integrity
    - Updated_at triggers for audit trails
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_code text UNIQUE NOT NULL,
  name text NOT NULL,
  speed text NOT NULL,
  price numeric(10,2) NOT NULL,
  price_display text NOT NULL,
  description text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coverage_areas table
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

-- Create service_providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone_number text NOT NULL,
  preferred_language language_code NOT NULL DEFAULT 'en',
  gps_coordinates text,
  gps_location text,
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

-- Create customer_interactions table
CREATE TABLE IF NOT EXISTS customer_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  session_id text,
  interaction_type interaction_type NOT NULL,
  message_text text,
  bot_response text,
  quick_reply_selected text,
  metadata jsonb DEFAULT '{}'::jsonb,
  language_used language_code,
  timestamp timestamptz DEFAULT now(),
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now()
);

-- Create customer_journey_events table
CREATE TABLE IF NOT EXISTS customer_journey_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  from_stage journey_stage,
  to_stage journey_stage NOT NULL,
  event_trigger text,
  event_data jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now()
);

-- Create customer_package_selections table
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

-- Create coverage_area_service_providers junction table
CREATE TABLE IF NOT EXISTS coverage_area_service_providers (
  coverage_area_id uuid NOT NULL REFERENCES coverage_areas(id) ON DELETE CASCADE,
  service_provider_id uuid NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (coverage_area_id, service_provider_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_sort_order ON packages(sort_order);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_journey_stage ON customers(current_journey_stage);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_gps_location ON customers(gps_location);
CREATE INDEX IF NOT EXISTS idx_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON customer_interactions(timestamp);

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coverage_areas_updated_at ON coverage_areas;
CREATE TRIGGER update_coverage_areas_updated_at
  BEFORE UPDATE ON coverage_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_providers_updated_at ON service_providers;
CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_package_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_area_service_providers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for packages
DROP POLICY IF EXISTS "Public can read packages" ON packages;
CREATE POLICY "Public can read packages"
  ON packages
  FOR SELECT
  TO public
  USING (true);

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

-- Create RLS policies for coverage_areas
DROP POLICY IF EXISTS "Public can read coverage areas" ON coverage_areas;
CREATE POLICY "Public can read coverage areas"
  ON coverage_areas
  FOR SELECT
  TO public
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

-- Create RLS policies for service_providers
DROP POLICY IF EXISTS "Public can read service providers" ON service_providers;
CREATE POLICY "Public can read service providers"
  ON service_providers
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage service providers" ON service_providers;
CREATE POLICY "Authenticated users can manage service providers"
  ON service_providers
  FOR ALL
  TO authenticated
  USING (true);

-- Create RLS policies for customers
DROP POLICY IF EXISTS "Public can create customers" ON customers;
CREATE POLICY "Public can create customers"
  ON customers
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read customers for insert operations" ON customers;
CREATE POLICY "Public can read customers for insert operations"
  ON customers
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can read customers" ON customers;
CREATE POLICY "Authenticated users can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;
CREATE POLICY "Authenticated users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete customers" ON customers;
CREATE POLICY "Authenticated users can delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for customer_interactions
DROP POLICY IF EXISTS "Public can create customer interactions" ON customer_interactions;
CREATE POLICY "Public can create customer interactions"
  ON customer_interactions
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read customer interactions" ON customer_interactions;
CREATE POLICY "Public can read customer interactions"
  ON customer_interactions
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can read customer interactions" ON customer_interactions;
CREATE POLICY "Authenticated users can read customer interactions"
  ON customer_interactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for customer_journey_events
DROP POLICY IF EXISTS "Public can create journey events" ON customer_journey_events;
CREATE POLICY "Public can create journey events"
  ON customer_journey_events
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read journey events" ON customer_journey_events;
CREATE POLICY "Public can read journey events"
  ON customer_journey_events
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can read journey events" ON customer_journey_events;
CREATE POLICY "Authenticated users can read journey events"
  ON customer_journey_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for customer_package_selections
DROP POLICY IF EXISTS "Public can create package selections" ON customer_package_selections;
CREATE POLICY "Public can create package selections"
  ON customer_package_selections
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read package selections" ON customer_package_selections;
CREATE POLICY "Public can read package selections"
  ON customer_package_selections
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can read package selections" ON customer_package_selections;
CREATE POLICY "Authenticated users can read package selections"
  ON customer_package_selections
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for coverage_area_service_providers
DROP POLICY IF EXISTS "Public can read active coverage area service providers" ON coverage_area_service_providers;
CREATE POLICY "Public can read active coverage area service providers"
  ON coverage_area_service_providers
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage coverage area service providers" ON coverage_area_service_providers;
CREATE POLICY "Authenticated users can manage coverage area service providers"
  ON coverage_area_service_providers
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample data for packages
INSERT INTO packages (package_code, name, speed, price, price_display, description, features, is_popular, sort_order) VALUES
  ('basic', 'Farm Connect', '10 Mbps', 15.00, 'R15/day', 'Perfect for WhatsApp, email, and basic browsing', 
   '["WhatsApp & social media", "Email & basic browsing", "Weather updates", "Banking apps", "No contract required"]'::jsonb, 
   false, 1),
  ('standard', 'Family Plus', '25 Mbps', 25.00, 'R25/day', 'Great for families - streaming and video calls', 
   '["Everything in Farm Connect", "Video calls with family", "YouTube & Netflix", "Multiple devices", "Priority support"]'::jsonb, 
   true, 2),
  ('premium', 'Business Pro', '50 Mbps', 45.00, 'R45/day', 'For small businesses and heavy users', 
   '["Everything in Family Plus", "Fast file uploads", "Video conferencing", "Cloud backup", "24/7 business support"]'::jsonb, 
   false, 3)
ON CONFLICT (package_code) DO NOTHING;

-- Insert sample data for coverage areas
INSERT INTO coverage_areas (area_name, area_type, center_lat, center_lng, radius_km, coverage_quality) VALUES
  ('Johannesburg Metro', 'city', -26.2041, 28.0473, 50.0, 'excellent'),
  ('Cape Town Metro', 'city', -33.9249, 18.4241, 45.0, 'excellent'),
  ('Durban Metro', 'city', -29.8587, 31.0218, 40.0, 'good'),
  ('Pretoria Metro', 'city', -25.7479, 28.2293, 35.0, 'good'),
  ('West Rand Rural', 'rural', -26.1500, 27.7500, 75.0, 'fair'),
  ('KwaZulu-Natal Midlands', 'rural', -29.5000, 30.2500, 80.0, 'good')
ON CONFLICT DO NOTHING;

-- Insert sample data for service providers
INSERT INTO service_providers (name, description) VALUES
  ('Openserve', 'Telkom''s fibre network with wide coverage across South Africa'),
  ('Vumatel', 'Premium fibre infrastructure focused on residential areas'),
  ('Frogfoot', 'Independent fibre network operator serving multiple regions'),
  ('MetroFibre', 'Municipal fibre networks in major metropolitan areas')
ON CONFLICT (name) DO NOTHING;

-- Link service providers to coverage areas
INSERT INTO coverage_area_service_providers (coverage_area_id, service_provider_id)
SELECT ca.id, sp.id
FROM coverage_areas ca, service_providers sp
WHERE ca.area_name IN ('Johannesburg Metro', 'Cape Town Metro', 'Durban Metro', 'Pretoria Metro')
  AND sp.name IN ('Openserve', 'Vumatel')
ON CONFLICT DO NOTHING;

INSERT INTO coverage_area_service_providers (coverage_area_id, service_provider_id)
SELECT ca.id, sp.id
FROM coverage_areas ca, service_providers sp
WHERE ca.area_name IN ('West Rand Rural', 'KwaZulu-Natal Midlands')
  AND sp.name = 'Openserve'
ON CONFLICT DO NOTHING;