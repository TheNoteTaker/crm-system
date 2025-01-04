/*
  # Fix Users Table Policies
  
  1. Changes
    - Drops problematic recursive policies
    - Adds new simplified policies for users table
    - Ensures proper tenant isolation
  
  2. Security
    - Users can read their own profile
    - Users can read other users in their tenant
    - Users can update their own profile
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "tenant_isolation_users" ON users;

-- Create new simplified policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  USING (
    -- User can read their own profile
    auth.uid() = id
    OR
    -- User can read profiles in their tenant
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);