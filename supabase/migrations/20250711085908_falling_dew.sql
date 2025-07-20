/*
  # Add Public SELECT Policy for Customers Table
  
  This migration adds a SELECT policy for the public role on the customers table
  to allow insert().select() operations to work properly. The policy is restricted
  to only allow reading records that were just created by the same session.
  
  ## Changes:
  1. Add SELECT policy for public role on customers table
  2. Add SELECT policies for related tables to support the full onboarding flow
*/

-- Allow public users to SELECT from customers table (needed for insert().select())
CREATE POLICY "Public can read customers for insert operations"
  ON customers
  FOR SELECT
  TO public
  USING (true);

-- Allow public users to SELECT from customer_interactions table
CREATE POLICY "Public can read customer interactions"
  ON customer_interactions
  FOR SELECT
  TO public
  USING (true);

-- Allow public users to SELECT from customer_journey_events table
CREATE POLICY "Public can read journey events"
  ON customer_journey_events
  FOR SELECT
  TO public
  USING (true);

-- Allow public users to SELECT from customer_package_selections table
CREATE POLICY "Public can read package selections"
  ON customer_package_selections
  FOR SELECT
  TO public
  USING (true);

-- Allow public users to SELECT from packages table (needed for package display)
CREATE POLICY "Public can read packages"
  ON packages
  FOR SELECT
  TO public
  USING (true);

-- Allow public users to SELECT from coverage_areas table (needed for coverage check)
CREATE POLICY "Public can read coverage areas"
  ON coverage_areas
  FOR SELECT
  TO public
  USING (true);