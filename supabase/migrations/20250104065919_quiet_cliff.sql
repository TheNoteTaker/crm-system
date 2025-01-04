/*
  # Initial Setup Migration
  
  1. New Data
    - Creates initial tenant with fixed UUID
    - Creates admin user with fixed UUID
    - Sets up auth policies
  
  2. Security
    - Adds policies for authenticated users
    - Ensures proper tenant isolation
*/

-- Create initial tenant
INSERT INTO tenants (id, name, domain)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Organization',
  'example.com'
);

-- Create admin user
INSERT INTO users (
  id,
  tenant_id,
  email,
  role,
  name,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  'admin',
  'Admin User',
  'https://cdn.usegalileo.ai/stability/117a7a12-7704-4917-9139-4a3f76c42e78.png'
);

-- Add auth policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Add tenant access policy
CREATE POLICY "Users can access own tenant data"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE tenant_id = tenants.id
    )
  );