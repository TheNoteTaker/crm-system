/*
  # Add User Profile Function
  
  1. New Functions
    - `get_user_profile`: Retrieves user profile with tenant info
    
  2. Security
    - Function is accessible to authenticated users
    - Users can only get their own profile or profiles in their tenant
*/

-- Create function to get user profile with tenant info
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role user_role,
  avatar_url TEXT,
  tenant_id UUID,
  tenant_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.avatar_url,
    u.tenant_id,
    t.name as tenant_name,
    u.created_at,
    u.updated_at
  FROM users u
  JOIN tenants t ON t.id = u.tenant_id
  WHERE u.id = user_id
  AND (
    -- User can only get their own profile or profiles in their tenant
    u.id = auth.uid() 
    OR 
    u.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );
END;
$$;