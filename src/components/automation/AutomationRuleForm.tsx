import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { automationSchema } from '../../lib/validations';
import { AutomationFormData } from '../../lib/types/automation';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface AutomationRuleFormProps {
  onSubmit: (data: AutomationFormData) => Promise<void>;
  onCancel: () => void;
}

export function AutomationRuleForm({ onSubmit, onCancel }: AutomationRuleFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(automationSchema)
  });

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      toast.success('Automation rule created successfully');
    } catch (error) {
      toast.error('Failed to create automation rule');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Rule Name
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-hover text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Trigger Type
        </label>
        <select
          {...register('trigger_type')}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-hover text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="new_customer">New Customer Created</option>
          <option value="customer_status_change">Customer Status Changed</option>
          <option value="high_value_order">High Value Order</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Action Type
        </label>
        <select
          {...register('action_type')}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-hover text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="send_email">Send Email</option>
          <option value="create_task">Create Task</option>
          <option value="webhook">Call Webhook</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Rule
        </Button>
      </div>
    </form>
  );
}