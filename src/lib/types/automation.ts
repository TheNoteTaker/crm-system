import { z } from 'zod';
import { automationSchema } from '../validations';

export type AutomationFormData = z.infer<typeof automationSchema>;

export interface TriggerConfig {
  new_customer?: {
    tags?: string[];
  };
  customer_status_change?: {
    from?: string;
    to?: string;
  };
  high_value_order?: {
    threshold: number;
  };
}

export interface ActionConfig {
  send_email?: {
    template: string;
    subject: string;
  };
  create_task?: {
    title: string;
    assignee?: string;
  };
  webhook?: {
    url: string;
    method: 'POST' | 'PUT';
    headers?: Record<string, string>;
  };
}