import { Database as DatabaseGenerated } from './database.generated.types'

export type Database = DatabaseGenerated & {
  public: {
    Tables: {
      onboarding_workflow_states: {
        Row: {
          id: string
          organisation_id: string | null
          current_step: 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup' | 'complete'
          is_completed: boolean
          last_updated: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id?: string | null
          current_step: 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup' | 'complete'
          is_completed?: boolean
          last_updated?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string | null
          current_step?: 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup' | 'complete'
          is_completed?: boolean
          last_updated?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
