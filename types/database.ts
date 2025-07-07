export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      consultations: {
        Row: {
          client_id: string
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          final_cost: number | null
          id: number
          operator_id: string
          service_id: number
          started_at: string | null
          status: Database["public"]["Enums"]["consultation_status"]
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          final_cost?: number | null
          id?: number
          operator_id: string
          service_id: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          final_cost?: number | null
          id?: number
          operator_id?: string
          service_id?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          application_status: Database["public"]["Enums"]["application_status"] | null
          avatar_url: string | null
          bio: string | null
          commission_rate: number | null
          created_at: string
          full_name: string | null
          id: string
          is_visible: boolean | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          specializations: string[] | null
          updated_at: string
          wallet_balance: number
        }
        Insert: {
          application_status?: Database["public"]["Enums"]["application_status"] | null
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number | null
          created_at?: string
          full_name?: string | null
          id: string
          is_visible?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specializations?: string[] | null
          updated_at?: string
          wallet_balance?: number
        }
        Update: {
          application_status?: Database["public"]["Enums"]["application_status"] | null
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_visible?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specializations?: string[] | null
          updated_at?: string
          wallet_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          id: number
          operator_id: string
          rating: number
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          id?: number
          operator_id: string
          rating: number
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: number
          operator_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          operator_id: string
          price_per_consultation: number | null
          price_per_minute: number | null
          type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          operator_id: string
          price_per_consultation?: number | null
          price_per_minute?: number | null
          type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          operator_id?: string
          price_per_consultation?: number | null
          price_per_minute?: number | null
          type?: Database["public"]["Enums"]["service_type"]
        }
        Relationships: [
          {
            foreignKeyName: "services_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          consultation_id: number | null
          created_at: string
          currency: string
          id: number
          status: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          consultation_id?: number | null
          created_at?: string
          currency?: string
          id?: number
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          consultation_id?: number | null
          created_at?: string
          currency?: string
          id?: number
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_availability: {
        Row: {
          id: number
          operator_id: string
          day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
          start_time: string
          end_time: string
          is_available: boolean
        }
        Insert: {
          id?: number
          operator_id: string
          day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
          start_time: string
          end_time: string
          is_available?: boolean
        }
        Update: {
          id?: number
          operator_id?: string
          day_of_week?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
          start_time?: string
          end_time?: string
          is_available?: boolean
        }
      }
      operator_services: {
        Row: {
          id: number
          operator_id: string
          service_type: "chat" | "call" | "video" | "email"
          price_per_minute: number | null
          price_per_session: number | null
          is_active: boolean
        }
        Insert: {
          id?: number
          operator_id: string
          service_type: "chat" | "call" | "video" | "email"
          price_per_minute?: number | null
          price_per_session?: number | null
          is_active?: boolean
        }
        Update: {
          id?: number
          operator_id?: string
          service_type?: "chat" | "call" | "video" | "email"
          price_per_minute?: number | null
          price_per_session?: number | null
          is_active?: boolean
        }
      }
      operator_specializations: {
        Row: {
          operator_id: string
          specialization_id: number
        }
        Insert: {
          operator_id: string
          specialization_id: number
        }
        Update: {
          operator_id?: string
          specialization_id?: number
        }
      }
      operators: {
        Row: {
          id: string
          display_name: string
          description: string | null
          status: "pending" | "approved" | "rejected" | "suspended"
          is_online: boolean
          profile_image_url: string | null
          average_rating: number | null
          reviews_count: number | null
          joined_at: string | null
          last_seen: string | null
        }
        Insert: {
          id: string
          display_name: string
          description?: string | null
          status?: "pending" | "approved" | "rejected" | "suspended"
          is_online?: boolean
          profile_image_url?: string | null
          average_rating?: number | null
          reviews_count?: number | null
          joined_at?: string | null
          last_seen?: string | null
        }
        Update: {
          id?: string
          display_name?: string
          description?: string | null
          status?: "pending" | "approved" | "rejected" | "suspended"
          is_online?: boolean
          profile_image_url?: string | null
          average_rating?: number | null
          reviews_count?: number | null
          joined_at?: string | null
          last_seen?: string | null
        }
      }
      specializations: {
        Row: {
          id: number
          name: string
          description: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "client" | "operator" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "client" | "operator" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "client" | "operator" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      handle_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: Record<PropertyKey, never>
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      consultation_status: "pending" | "active" | "completed" | "cancelled"
      day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
      operator_status: "pending" | "approved" | "rejected" | "suspended"
      service_type: "chat" | "call" | "video" | "email"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type: "recharge" | "payment" | "payout" | "refund"
      user_role: "client" | "operator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Custom type for our profile, easier to use in the app
export type Profile = Tables<"profiles">
