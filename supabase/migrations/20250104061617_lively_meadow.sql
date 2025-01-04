/*
  # Add deals table and related schema updates

  1. New Tables
    - `deals` table for tracking sales pipeline
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key)
      - `customer_id` (uuid, foreign key)
      - `name` (text)
      - `stage` (enum)
      - `amount` (decimal)
      - `close_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on deals table
    - Add policy for tenant isolation
*/

-- Create deal stage enum
CREATE TYPE deal_stage AS ENUM (
  'prospect',
  'qualified',
  'negotiation',
  'won',
  'lost'
);

-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  name TEXT NOT NULL,
  stage deal_stage NOT NULL DEFAULT 'prospect',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  close_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY tenant_isolation_deals ON deals
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE tenant_id = deals.tenant_id
  ));

-- Create indexes
CREATE INDEX idx_deals_tenant ON deals(tenant_id);
CREATE INDEX idx_deals_customer ON deals(customer_id);
CREATE INDEX idx_deals_stage ON deals(stage);