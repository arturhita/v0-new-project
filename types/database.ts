export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      consultations: {
        Row: {
          id: number
          client_id: string
          operator_id: string
          service_id: number
          status: "requested" | "accepted" | "in_progress" | "completed" | "canceled" | "refunded"
          started_at: string | null
          ended_at: string | null
          duration_minutes: number | null
          total_cost: number | null
          operator_earning: number | null
          platform_fee: number | null
          recording_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          client_id: string
          operator_id: string
          service_id: number
          status?: "requested" | "accepted" | "in_progress" | "completed" | "canceled" | "refunded"
          started_at?: string | null
          ended_at?: string | null
          duration_minutes?: number | null
          total_cost?: number | null
          operator_earning?: number | null
          platform_fee?: number | null
          recording_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          client_id?: string
          operator_id?: string
          service_id?: number
          status?: "requested" | "accepted" | "in_progress" | "completed" | "canceled" | "refunded"
          started_at?: string | null
          ended_at?: string | null
          duration_minutes?: number | null
          total_cost?: number | null
          operator_earning?: number | null
          platform_fee?: number | null
          recording_url?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: Profile
        Insert: {
          id: string
          role?: "client" | "operator" | "admin"
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          wallet_balance?: number
          headline?: string | null
          bio?: string | null
          specializations?: string[] | null
          is_online?: boolean
          online_status?: string | null
          application_status?: "pending" | "approved" | "rejected"
          is_visible?: boolean
          commission_rate?: number
          fiscal_code?: string | null
          vat_number?: string | null
          billing_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: "client" | "operator" | "admin"
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          wallet_balance?: number
          headline?: string | null
          bio?: string | null
          specializations?: string[] | null
          is_online?: boolean
          online_status?: string | null
          application_status?: "pending" | "approved" | "rejected"
          is_visible?: boolean
          commission_rate?: number
          fiscal_code?: string | null
          vat_number?: string | null
          billing_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          client_id: string
          operator_id: string
          consultation_id: number | null
          rating: number
          comment: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: number
          client_id: string
          operator_id: string
          consultation_id?: number | null
          rating: number
          comment?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          client_id?: string
          operator_id?: string
          consultation_id?: number | null
          rating?: number
          comment?: string | null
          is_approved?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: number
          operator_id: string
          type: "chat" | "call" | "written"
          price_per_minute: number | null
          price_per_consultation: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          operator_id: string
          type: "chat" | "call" | "written"
          price_per_minute?: number | null
          price_per_consultation?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          operator_id?: string
          type?: "chat" | "call" | "written"
          price_per_minute?: number | null
          price_per_consultation?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: number
          user_id: string
          type: "recharge" | "consultation_payment" | "payout" | "refund"
          amount: number
          consultation_id: number | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          type: "recharge" | "consultation_payment" | "payout" | "refund"
          amount: number
          consultation_id?: number | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          type?: "recharge" | "consultation_payment" | "payout" | "refund"
          amount?: number
          consultation_id?: number | null
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Service = Database["public"]["Tables"]["services"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type Consultation = Database["public"]["Tables"]["consultations"]["Row"]
