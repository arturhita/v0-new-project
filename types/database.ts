import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js"

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: "client" | "operator" | "admin"
          avatar_url: string | null
          wallet_balance: number
          status: "pending_approval" | "active" | "inactive" | "suspended" | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: "client" | "operator" | "admin"
          avatar_url?: string | null
          wallet_balance?: number
          status?: "pending_approval" | "active" | "inactive" | "suspended" | null
        }
        Update: {
          name?: string | null
          email?: string | null
          role?: "client" | "operator" | "admin"
          avatar_url?: string | null
          wallet_balance?: number
          status?: "pending_approval" | "active" | "inactive" | "suspended" | null
        }
      }
      operator_details: {
        Row: {
          id: string
          stage_name: string
          bio: string | null
          specialties: Json | null
          categories: string[] | null
          chat_price_per_minute: number | null
          call_price_per_minute: number | null
          written_consultation_price: number | null
          is_chat_enabled: boolean
          is_call_enabled: boolean
          is_written_consultation_enabled: boolean
          average_rating: number
          total_reviews: number
          joined_at: string
        }
        Insert: {
          id: string
          stage_name: string
          bio?: string | null
        }
        Update: {
          stage_name?: string
          bio?: string | null
        }
      }
      chat_sessions: {
        Row: {
          id: string
          client_id: string
          operator_id: string
          status: "pending" | "accepted" | "declined" | "active" | "ended" | "cancelled"
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          operator_id: string
          status?: "pending" | "accepted" | "declined" | "active" | "ended" | "cancelled"
        }
        Update: {
          status?: "pending" | "accepted" | "declined" | "active" | "ended" | "cancelled"
        }
      }
      chat_messages: {
        Row: {
          id: number
          session_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          session_id: string
          sender_id: string
          content: string
        }
        Update: {
          content?: string
        }
      }
    }
    Views: {}
    Functions: {}
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

export type UserProfile = SupabaseUser & Tables<"profiles"> & { operator_details?: Tables<"operator_details"> }

export type SupabaseClientType = SupabaseClient<Database>
