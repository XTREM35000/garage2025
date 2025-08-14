export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          organisation_id: string | null
          path: string
          reason: string | null
          success: boolean
          timestamp: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          organisation_id?: string | null
          path: string
          reason?: string | null
          success: boolean
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          organisation_id?: string | null
          path?: string
          reason?: string | null
          success?: boolean
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_approvals: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          organisation_id: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          status: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_approvals_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string
          full_name: string | null
          id: string
          last_name: string
          notes: string | null
          organisation_id: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          last_name: string
          notes?: string | null
          organisation_id?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          organisation_id?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          can_access_system: boolean | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          email: string
          emergency_contact: Json | null
          employee_id: string | null
          first_name: string
          full_name: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          last_name: string
          national_id: string | null
          notes: string | null
          organisation_id: string | null
          permissions: Json | null
          phone: string | null
          position: string
          salary_grade: string | null
          speciality: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          can_access_system?: boolean | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          emergency_contact?: Json | null
          employee_id?: string | null
          first_name: string
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          national_id?: string | null
          notes?: string | null
          organisation_id?: string | null
          permissions?: Json | null
          phone?: string | null
          position: string
          salary_grade?: string | null
          speciality?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          can_access_system?: boolean | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          emergency_contact?: Json | null
          employee_id?: string | null
          first_name?: string
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          national_id?: string | null
          notes?: string | null
          organisation_id?: string | null
          permissions?: Json | null
          phone?: string | null
          position?: string
          salary_grade?: string | null
          speciality?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      garages: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string | null
          organisation_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          organisation_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          organisation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "garages_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          organisation_id: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          organisation_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          organisation_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          organisation_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisation_creation_log: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          organisation_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          organisation_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          organisation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organisation_creation_log_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          address: string | null
          city: string | null
          code: string
          config: Json | null
          country: string | null
          created_at: string | null
          created_by: string | null
          creation_date: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          owner_id: string | null
          parent_id: string | null
          phone: string | null
          plan_tier: string
          plan_type: string
          slug: string | null
          status: string | null
          storage_quota_mb: number | null
          subscription_end: string | null
          subscription_plan: string | null
          subscription_type: string | null
          trial_end_date: string | null
          user_quota: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code?: string
          config?: Json | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          creation_date?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          parent_id?: string | null
          phone?: string | null
          plan_tier?: string
          plan_type?: string
          slug?: string | null
          status?: string | null
          storage_quota_mb?: number | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_type?: string | null
          trial_end_date?: string | null
          user_quota?: number | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          config?: Json | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          creation_date?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          parent_id?: string | null
          phone?: string | null
          plan_tier?: string
          plan_type?: string
          slug?: string | null
          status?: string | null
          storage_quota_mb?: number | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_type?: string | null
          trial_end_date?: string | null
          user_quota?: number | null
        }
        Relationships: []
      }
      parts: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          feature_name: string
          feature_value: Json | null
          id: string
          plan_type: string
        }
        Insert: {
          feature_name: string
          feature_value?: Json | null
          id?: string
          plan_type: string
        }
        Update: {
          feature_name?: string
          feature_value?: Json | null
          id?: string
          plan_type?: string
        }
        Relationships: []
      }
      plan_quotas: {
        Row: {
          id: string
          plan_type: string
          quota_name: string
          quota_value: number | null
        }
        Insert: {
          id?: string
          plan_type: string
          quota_name: string
          quota_value?: number | null
        }
        Update: {
          id?: string
          plan_type?: string
          quota_name?: string
          quota_value?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          description: string | null
          id: string
          name: string
          organisation_id: string | null
          price: number | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          organisation_id?: string | null
          price?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          organisation_id?: string | null
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          actif: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organisation_id: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          organisation_id?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organisation_id?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      repairs: {
        Row: {
          description: string
          end_date: string | null
          id: string
          organisation_id: string | null
          start_date: string | null
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          description: string
          end_date?: string | null
          id?: string
          organisation_id?: string | null
          start_date?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          description?: string
          end_date?: string | null
          id?: string
          organisation_id?: string | null
          start_date?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          movement_type: string
          organisation_id: string | null
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_type: string
          organisation_id?: string | null
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_type?: string
          organisation_id?: string | null
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          end_date: string | null
          id: string
          organisation_id: string | null
          plan_type: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          end_date?: string | null
          id?: string
          organisation_id?: string | null
          plan_type: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          organisation_id?: string | null
          plan_type?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string | null
          email: string
          est_actif: boolean | null
          id: string
          nom: string
          phone: string | null
          prenom: string
          setup_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          est_actif?: boolean | null
          id?: string
          nom: string
          phone?: string | null
          prenom: string
          setup_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          est_actif?: boolean | null
          id?: string
          nom?: string
          phone?: string | null
          prenom?: string
          setup_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_contexts: {
        Row: {
          current_organisation_id: string | null
          id: string
          preferences: Json | null
          user_id: string | null
        }
        Insert: {
          current_organisation_id?: string | null
          id?: string
          preferences?: Json | null
          user_id?: string | null
        }
        Update: {
          current_organisation_id?: string | null
          id?: string
          preferences?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_contexts_current_organisation_id_fkey"
            columns: ["current_organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organisations: {
        Row: {
          created_at: string | null
          id: string
          organisation_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organisation_id: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organisation_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organisations_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string | null
          est_actif: boolean | null
          id: string
          organisation_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          est_actif?: boolean | null
          id?: string
          organisation_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          est_actif?: boolean | null
          id?: string
          organisation_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          permissions: Json | null
          role_name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          permissions?: Json | null
          role_name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          permissions?: Json | null
          role_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          locale: string
          notifications_enabled: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          locale?: string
          notifications_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          locale?: string
          notifications_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          license_plate: string | null
          make: string
          model: string
          organisation_id: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          license_plate?: string | null
          make: string
          model: string
          organisation_id?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          license_plate?: string | null
          make?: string
          model?: string
          organisation_id?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_first_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_create_organisation_permissions: {
        Args: { p_owner_id: string }
        Returns: undefined
      }
      create_organisation_with_admin: {
        Args:
          | { admin_email: string; org_data: Json }
          | { admin_id: string; org_data: Json }
        Returns: Json
      }
      create_organisation_with_owner: {
        Args:
          | {
              p_bypass_auth?: boolean
              p_code: string
              p_email: string
              p_name: string
              p_owner_id: string
              p_slug: string
              p_subscription_type?: string
            }
          | {
              p_code: string
              p_email: string
              p_name: string
              p_owner_id: string
              p_slug: string
              p_subscription_type?: string
            }
        Returns: Json
      }
      create_organisation_with_owner_v2: {
        Args: {
          p_code: string
          p_email: string
          p_name: string
          p_owner_id: string
          p_slug: string
          p_subscription_type?: string
        }
        Returns: string
      }
      create_organization: {
        Args: {
          org_code: string
          org_email: string
          org_name: string
          org_slug: string
          org_subscription_type: string
        }
        Returns: Json
      }
      create_organization_with_owner: {
        Args: {
          org_code: string
          org_email: string
          org_name: string
          org_slug: string
          org_subscription_type: string
          owner_user_id: string
        }
        Returns: Json
      }
      create_user_profile: {
        Args: {
          avatar_url?: string
          email: string
          full_name: string
          organisation_id?: string
          phone?: string
          role?: string
          user_id: string
        }
        Returns: Json
      }
      create_user_simple: {
        Args: { user_email: string; user_id: string; user_role?: string }
        Returns: Json
      }
      disable_rls_for_org_creation: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      disable_rls_for_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_rls_after_org_creation: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_rls_for_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_in_transaction: {
        Args: { queries: Json[] }
        Returns: Json
      }
      generate_org_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_organisations: {
        Args: { user_uuid: string }
        Returns: {
          organisation_id: string
          role: string
        }[]
      }
      init_saas_schema: {
        Args: Record<PropertyKey, never> | { org_code: string }
        Returns: undefined
      }
      is_first_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never> | { userid: string }
        Returns: boolean
      }
      upsert_user_and_profile_v2: {
        Args: {
          p_avatar_url?: string
          p_email: string
          p_nom: string
          p_organisation_id?: string
          p_phone?: string
          p_prenom: string
          p_user_id: string
        }
        Returns: Json
      }
      upsert_user_profile: {
        Args: {
          avatar_url?: string
          full_name: string
          organization_id?: string
          phone?: string
          user_email: string
          user_id: string
          user_role?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
