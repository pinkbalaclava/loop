/*
  # Fix RLS Policies for Customer Creation - Corrected Syntax
  
  This migration fixes the Row Level Security policies to allow the frontend
  application (using anonymous/public role) to create new customer records
  while maintaining security for other operations.
  
  ## Changes:
  1. Remove overly restrictive policy for customers table
  2. Allow public role to INSERT new customers
  3. Allow authenticated users to SELECT, UPDATE, DELETE customers
  4. Apply same pattern to related tables for consistency
*/

-- Fix customers table RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;
DROP POLICY IF EXISTS "Public can create customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can read_update_delete customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update_delete customers" ON customers;

-- Allow public (anon key) users to INSERT new customers
CREATE POLICY "Public can create customers"
  ON customers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to SELECT customers
CREATE POLICY "Authenticated users can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to UPDATE customers
CREATE POLICY "Authenticated users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to DELETE customers
CREATE POLICY "Authenticated users can delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);

-- Fix customer_interactions table RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage customer interactions" ON customer_interactions;
DROP POLICY IF EXISTS "Public can create customer interactions" ON customer_interactions;
DROP POLICY IF EXISTS "Authenticated users can read customer interactions" ON customer_interactions;

CREATE POLICY "Public can create customer interactions"
  ON customer_interactions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read customer interactions"
  ON customer_interactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix customer_journey_events table RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage journey events" ON customer_journey_events;
DROP POLICY IF EXISTS "Public can create journey events" ON customer_journey_events;
DROP POLICY IF EXISTS "Authenticated users can read journey events" ON customer_journey_events;

CREATE POLICY "Public can create journey events"
  ON customer_journey_events
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read journey events"
  ON customer_journey_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix customer_package_selections table RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage package selections" ON customer_package_selections;
DROP POLICY IF EXISTS "Public can create package selections" ON customer_package_selections;
DROP POLICY IF EXISTS "Authenticated users can read package selections" ON customer_package_selections;

CREATE POLICY "Public can create package selections"
  ON customer_package_selections
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read package selections"
  ON customer_package_selections
  FOR SELECT
  TO authenticated
  USING (true);