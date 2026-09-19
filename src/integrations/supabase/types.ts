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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      collection_schedules: {
        Row: {
          collection_date: string
          company_id: string
          id: string
          notes: string | null
          status: string
          subscription_id: string | null
          time_slot: string | null
        }
        Insert: {
          collection_date: string
          company_id: string
          id?: string
          notes?: string | null
          status?: string
          subscription_id?: string | null
          time_slot?: string | null
        }
        Update: {
          collection_date?: string
          company_id?: string
          id?: string
          notes?: string | null
          status?: string
          subscription_id?: string | null
          time_slot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_schedules_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          registration_number: string | null
          status: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          registration_number?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          registration_number?: string | null
          status?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          location_id: string | null
          name: string
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location_id?: string | null
          name: string
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location_id?: string | null
          name?: string
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_receipts: {
        Row: {
          barcode: string | null
          company_id: string
          id: string
          issued_at: string
          payment_id: string
          qr_code: string | null
          status: string
        }
        Insert: {
          barcode?: string | null
          company_id: string
          id?: string
          issued_at?: string
          payment_id: string
          qr_code?: string | null
          status?: string
        }
        Update: {
          barcode?: string | null
          company_id?: string
          id?: string
          issued_at?: string
          payment_id?: string
          qr_code?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          address: string | null
          company_id: string | null
          created_at: string
          customer_id: string
          household_type: string | null
          id: string
          location_id: string | null
          status: string
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          customer_id: string
          household_type?: string | null
          id?: string
          location_id?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          customer_id?: string
          household_type?: string | null
          id?: string
          location_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          cell: string | null
          district: string
          id: string
          latitude: number | null
          longitude: number | null
          sector: string | null
          village: string | null
        }
        Insert: {
          cell?: string | null
          district: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          sector?: string | null
          village?: string | null
        }
        Update: {
          cell?: string | null
          district?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          sector?: string | null
          village?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          customer_id: string
          id: string
          payment_date: string
          payment_method: string
          period: string | null
          recorded_by: string | null
          status: string
          subscription_id: string | null
          transaction_reference: string | null
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          customer_id: string
          id?: string
          payment_date?: string
          payment_method?: string
          period?: string | null
          recorded_by?: string | null
          status?: string
          subscription_id?: string | null
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          payment_date?: string
          payment_method?: string
          period?: string | null
          recorded_by?: string | null
          status?: string
          subscription_id?: string | null
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string
          hire_date: string | null
          id: string
          license_number: string | null
          phone: string | null
          position: string | null
          status: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          hire_date?: string | null
          id: string
          license_number?: string | null
          phone?: string | null
          position?: string | null
          status?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          license_number?: string | null
          phone?: string | null
          position?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          company_id: string
          generated_at: string
          generated_by: string | null
          id: string
          period: string | null
          report_type: string
          summary: Json | null
        }
        Insert: {
          company_id: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          period?: string | null
          report_type: string
          summary?: Json | null
        }
        Update: {
          company_id?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          period?: string | null
          report_type?: string
          summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          company_id: string
          driver_id: string | null
          end_time: string | null
          id: string
          route_name: string
          schedule_id: string | null
          start_time: string | null
          status: string
          vehicle_id: string | null
          waste_type_id: string | null
        }
        Insert: {
          company_id: string
          driver_id?: string | null
          end_time?: string | null
          id?: string
          route_name: string
          schedule_id?: string | null
          start_time?: string | null
          status?: string
          vehicle_id?: string | null
          waste_type_id?: string | null
        }
        Update: {
          company_id?: string
          driver_id?: string | null
          end_time?: string | null
          id?: string
          route_name?: string
          schedule_id?: string | null
          start_time?: string | null
          status?: string
          vehicle_id?: string | null
          waste_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "collection_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_waste_type_id_fkey"
            columns: ["waste_type_id"]
            isOneToOne: false
            referencedRelation: "waste_types"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          company_id: string
          customer_id: string
          end_date: string | null
          id: string
          plan_type: string
          start_date: string
          status: string
        }
        Insert: {
          amount?: number
          company_id: string
          customer_id: string
          end_date?: string | null
          id?: string
          plan_type?: string
          start_date?: string
          status?: string
        }
        Update: {
          amount?: number
          company_id?: string
          customer_id?: string
          end_date?: string | null
          id?: string
          plan_type?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity: string | null
          company_id: string
          driver_id: string | null
          id: string
          plate_number: string
          status: string
          type: string | null
        }
        Insert: {
          capacity?: string | null
          company_id: string
          driver_id?: string | null
          id?: string
          plate_number: string
          status?: string
          type?: string | null
        }
        Update: {
          capacity?: string | null
          company_id?: string
          driver_id?: string | null
          id?: string
          plate_number?: string
          status?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_types: {
        Row: {
          category: string | null
          company_id: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          company_id?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_company_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_company_staff: { Args: { _company_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "company_admin" | "employee" | "driver" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "company_admin", "employee", "driver", "customer"],
    },
  },
} as const
