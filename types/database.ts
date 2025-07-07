export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: "client" | "operator" | "admin"
          status: "pending" | "active" | "suspended"
          is_online: boolean
          is_available: boolean
          stage_name: string | null
          bio: string | null
          headline: string | null
          profile_image_url: string | null
          main_discipline: string | null
          specialties: string[] | null
          chat_price_per_minute: number | null
          call_price_per_minute: number | null
          video_price_per_minute: number | null
          average_rating: number | null
          review_count: number | null
          commission_rate: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role?: "client" | "operator" | "admin"
          status?: "pending" | "active" | "suspended"
          // ... other fields
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: "client" | "operator" | "admin"
          status?: "pending" | "active" | "suspended"
          // ... other fields
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          operator_id: string
          client_id: string
          rating: number
          comment: string | null
          is_approved: boolean
          client?: { full_name: string | null; avatar_url: string | null }
        }
        Insert: {
          id: string
          created_at: string
          operator_id: string
          client_id: string
          rating: number
          comment?: string | null
          is_approved?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          operator_id?: string
          client_id?: string
          rating?: number
          comment?: string | null
          is_approved?: boolean
        }
      }
      // ... other tables
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
