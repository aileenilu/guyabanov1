/*
# Create leads table for Guyabano Wine landing page

## Summary
Creates a table to store lead customer information from the Guyabano Wine landing page order form.

## New Tables
- `leads`
  - `id` (uuid, primary key)
  - `full_name` (text, not null) - Customer's full name
  - `phone` (text, not null) - Philippine phone number (validated on client)
  - `address` (text, not null) - Delivery address
  - `quantity` (integer, not null) - Number of bottles (1 or 2)
  - `package` (text, not null) - Package chosen: '1_bottle' or '2_bottle'
  - `total_price` (integer, not null) - Total price in PHP
  - `notes` (text) - Optional additional notes from customer
  - `created_at` (timestamptz) - Timestamp of submission

## Security
- RLS enabled on `leads` table.
- Anon + authenticated can INSERT (for public landing page form submissions).
- Only authenticated users can SELECT (admin use).
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  package text NOT NULL DEFAULT '1_bottle',
  total_price integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_leads" ON leads;
CREATE POLICY "auth_select_leads" ON leads FOR SELECT
  TO authenticated USING (true);
