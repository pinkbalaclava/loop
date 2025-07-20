/*
  # Add Service Providers and Coverage Area Service Providers Tables
  
  This migration introduces two new tables to manage internet service providers
  and their availability within specific coverage areas.
  
  ## New Tables:
  1. service_providers - Stores details about each internet service provider
  2. coverage_area_service_providers - Junction table linking coverage areas
     to service providers, establishing a many-to-many relationship
  
  ## Features:
  - Row Level Security (RLS) enabled on both new tables
  - Foreign key constraints to maintain data integrity
  - Initial sample data for 'Openserve' and 'Vumatel' inserted
  - Links 'Openserve' and 'Vumatel' to all existing coverage areas
*/

-- 1. SERVICE_PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. COVERAGE_AREA_SERVICE_PROVIDERS TABLE (Junction Table)
CREATE TABLE IF NOT EXISTS coverage_area_service_providers (
  coverage_area_id uuid REFERENCES coverage_areas(id) ON DELETE CASCADE,
  service_provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  system_input_process text DEFAULT 'bolt',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (coverage_area_id, service_provider_id)
);

-- Enable Row Level Security for new tables
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_area_service_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_providers
CREATE POLICY "Public can read service providers"
  ON service_providers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage service providers"
  ON service_providers
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for coverage_area_service_providers
CREATE POLICY "Public can read active coverage area service providers"
  ON coverage_area_service_providers
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage coverage area service providers"
  ON coverage_area_service_providers
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample data for service_providers
INSERT INTO service_providers (name, description) VALUES
('Openserve', 'Telkom''s fibre network with wide coverage across South Africa'),
('Vumatel', 'Premium fibre infrastructure focused on residential areas')
ON CONFLICT (name) DO NOTHING;

-- Link Openserve and Vumatel to all existing coverage_areas
INSERT INTO coverage_area_service_providers (coverage_area_id, service_provider_id)
SELECT
  ca.id,
  sp.id
FROM
  coverage_areas ca,
  service_providers sp
WHERE
  sp.name IN ('Openserve', 'Vumatel')
ON CONFLICT (coverage_area_id, service_provider_id) DO NOTHING;

-- Add updated_at trigger for service_providers table
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();