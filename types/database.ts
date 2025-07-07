export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      consultations: {
        Row: {
          client_id: string
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: number
          operator_earning: number | null
          operator_id: string
          platform_fee: number | null
          recording_url: string | null
          service_id: number
          started_at: string | null
          status: Database["public"]["Enums"]["consultation_status"]
          total_cost: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: number
          operator_earning?: number | null
          operator_id: string
          platform_fee?: number | null
          recording_url?: string | null
          service_id: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          total_cost?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: number
          operator_earning?: number | null
          operator_id?: string
          platform_fee?: number | null
          recording_url?: string | null
          service_id?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_operator_id_fkey"
            columns: ["operator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          application_status: Database["public"]["Enums"]["application_status"]
          avatar_url: string | null
          bio: string | null
          billing_address: string | null
          commission_rate: number
          created_at: string
          email: string | null
          fiscal_code: string | null
          full_name: string | null
          headline: string | null
          id: string
          is_online: boolean
          is_visible: boolean
          online_status: string | null
          role: Database["public"]["Enums"]["user_role"]
          specializations: string[] | null
          updated_at: string
          vat_number: string | null
          wallet_balance: number
        }
        Insert: {
          application_status?: Database["public"]["Enums"]["application_status"]
          avatar_url?: string | null
          bio?: string | null
          billing_address?: string | null
          commission_rate?: number
          created_at?: string
          email?: string | null
          fiscal_code?: string | null
          full_name?: string | null
          headline?: string | null
          id: string
          is_online?: boolean
          is_visible?: boolean
          online_status?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specializations?: string[] | null
          updated_at?: string
          vat_number?: string | null
          wallet_balance?: number
        }
        Update: {
          application_status?: Database["public"]["Enums"]["application_status"]
          avatar_url?: string | null
          bio?: string | null
          billing_address?: string | null
          commission_rate?: number
          created_at?: string
          email?: string | null
          fiscal_code?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          is_online?: boolean
          is_visible?: boolean
          online_status?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specializations?: string[] | null
          updated_at?: string
          vat_number?: string | null
          wallet_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          consultation_id: number | null
          created_at: string
          id: number
          is_approved: boolean
          operator_id: string
          rating: number
        }
        Insert: {
          client_id: string
          comment?: string | null
          consultation_id?: number | null
          created_at?: string
          id?: number
          is_approved?: boolean
          operator_id: string
          rating: number
        }
        Update: {
          client_id?: string
          comment?: string | null
          consultation_id?: number | null
          created_at?: string
          id?: number
          is_approved?: boolean
          operator_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_operator_id_fkey"
            columns: ["operator_id"]
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
          description: string | null
          id: number
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          consultation_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          consultation_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_consultation_id_fkey"
            columns: ["consultation_id"]
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      sync_profiles_from_auth: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      consultation_status: "requested" | "accepted" | "in_progress" | "completed" | "canceled" | "refunded"
      service_type: "chat" | "call" | "written"
      transaction_type: "recharge" | "consultation_payment" | "payout" | "refund"
      user_role: "client" | "operator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
