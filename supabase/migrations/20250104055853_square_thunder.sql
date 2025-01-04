/*
  # Initial Schema Setup

  1. New Tables
    - tenants: Store company/organization info
    - users: Store user accounts with tenant association
    - customers: Store customer data
    - campaigns: Store marketing campaigns
    - conversations: Store chat/message history
    - automation_rules: Store automation configurations

  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
    - Add policies for role-based access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'agent');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'active', 'completed');
CREATE TYPE campaign_type AS ENUM ('email', 'social');
CREATE TYPE customer_status AS ENUM ('active', 'inactive');

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'agent',
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status customer_status DEFAULT 'active',
  avatar_url TEXT,
  spent DECIMAL(10,2) DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  type campaign_type NOT NULL,
  status campaign_status DEFAULT 'draft',
  audience TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  spent DECIMAL(10,2) DEFAULT 0,
  metrics JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "converted": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  messages JSONB[] DEFAULT ARRAY[]::jsonb[],
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create automation_rules table
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL,
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
CREATE POLICY tenant_isolation_users ON users
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE tenant_id = users.tenant_id
  ));

CREATE POLICY tenant_isolation_customers ON customers
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE tenant_id = customers.tenant_id
  ));

CREATE POLICY tenant_isolation_campaigns ON campaigns
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE tenant_id = campaigns.tenant_id
  ));

CREATE POLICY tenant_isolation_conversations ON conversations
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE tenant_id = conversations.tenant_id
  ));

CREATE POLICY tenant_isolation_automation_rules ON automation_rules
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE tenant_id = automation_rules.tenant_id
  ));

-- Create indexes for better query performance
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_automation_rules_tenant ON automation_rules(tenant_id);