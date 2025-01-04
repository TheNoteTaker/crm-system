import { PostgrestError } from '@supabase/supabase-js';

/**
 * Standardized database error interface
 */
export interface DatabaseError {
  code: string;
  message: string;
  type: 'validation' | 'constraint' | 'unknown';
  field?: string;
  details?: string;
}

/**
 * Convert Supabase PostgrestError to standardized DatabaseError
 */
export function handleDatabaseError(error: PostgrestError): DatabaseError {
  // Handle unique constraint violations
  if (error.code === '23505') {
    const field = error.details?.match(/Key \((.*?)\)=/)?.[1] || 'unknown';
    return {
      code: error.code,
      message: `A record with this ${field} already exists`,
      type: 'constraint',
      field
    };
  }

  // Handle foreign key violations
  if (error.code === '23503') {
    return {
      code: error.code,
      message: 'Referenced record does not exist',
      type: 'constraint'
    };
  }

  // Handle validation errors
  if (error.code === '23502') {
    const field = error.details?.match(/column "(.*?)"/)?.[1] || 'unknown';
    return {
      code: error.code,
      message: `${field} is required`,
      type: 'validation',
      field
    };
  }

  // Default error
  return {
    code: error.code,
    message: error.message,
    type: 'unknown'
  };
}

/**
 * Check if an error is a DatabaseError
 */
export function isDatabaseError(error: any): error is DatabaseError {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'type' in error &&
    'message' in error
  );
}