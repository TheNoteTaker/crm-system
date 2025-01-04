export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          domain: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: 'admin' | 'manager' | 'agent'
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          role?: 'admin' | 'manager' | 'agent'
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          role?: 'admin' | 'manager' | 'agent'
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          tenant_id: string
          name: string
          email: string
          status: 'active' | 'inactive'
          avatar_url: string | null
          spent: number
          last_order_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          email: string
          status?: 'active' | 'inactive'
          avatar_url?: string | null
          spent?: number
          last_order_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          email?: string
          status?: 'active' | 'inactive'
          avatar_url?: string | null
          spent?: number
          last_order_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}