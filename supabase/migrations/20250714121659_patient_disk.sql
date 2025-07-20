/*
  # Add selected_service_provider_id to customers table
  
  This migration adds a new column to the customers table to store
  the customer's selected service provider.
  
  ## Changes:
  1. Add selected_service_provider_id column to customers table
  2. Add foreign key constraint to service_providers table
  3. Add index for performance
*/

-- Add selected_service_provider_id column to customers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'selected_service_provider_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN selected_service_provider_id uuid REFERENCES service_providers(id);
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_customers_selected_service_provider ON customers(selected_service_provider_id);

-- Add comment for documentation
COMMENT ON COLUMN customers.selected_service_provider_id IS 'Reference to the service provider selected by the customer during onboarding';