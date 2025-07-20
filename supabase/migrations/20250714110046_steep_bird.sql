/*
  # Add GPS Location Field to Customers Table
  
  This migration adds a human-readable location field to store the resolved
  location name from GPS coordinates for better user experience and reporting.
  
  ## Changes:
  1. Add gps_location field to customers table
  2. Add index for location-based queries
  3. Update RLS policies to include new field
*/

-- Add gps_location field to customers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'gps_location'
  ) THEN
    ALTER TABLE customers ADD COLUMN gps_location text;
  END IF;
END $$;

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_customers_gps_location ON customers(gps_location);

-- Add comment for documentation
COMMENT ON COLUMN customers.gps_location IS 'Human-readable location name resolved from GPS coordinates (e.g., "Johannesburg, Gauteng, South Africa")';