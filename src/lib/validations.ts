import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['active', 'inactive']).default('active'),
  avatar_url: z.string().optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['email', 'social']),
  status: z.enum(['draft', 'scheduled', 'active', 'completed']).default('draft'),
  audience: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  budget: z.number().positive('Budget must be positive'),
});

export const automationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  trigger_type: z.enum(['new_customer', 'customer_status_change', 'high_value_order']),
  trigger_config: z.record(z.any()),
  action_type: z.enum(['send_email', 'create_task', 'webhook']),
  action_config: z.record(z.any()),
});