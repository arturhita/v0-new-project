export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Profile = {
  average_rating: number | null
  bio: string | null
  call_price_per_minute: number | null
  chat_price_per_minute: number | null
  commission_rate: number | null
  created_at: string | null
  email: string | null
  full_name: string | null
  headline: string | null
  id: string
  is_available: boolean | null
  is_online: boolean | null
  main_discipline: string | null
  profile_image_url: string | null
  review_count: number | null
  role: string
  specialties: string[] | null
  stage_name: string | null
  status: string | null
  updated_at: string | null
  video_price_per_minute: number | null
}

export type Review = {
  client: {
    full_name?: string
    avatar_url?: string
  } | null
  client_id: string
  comment: string | null
  created_at: string | null
  id: string
  operator: {
    stage_name?: string
  } | null
  operator_id: string
  rating: number
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: {
          average_rating?: number | null
          bio?: string | null
          call_price_per_minute?: number | null
          chat_price_per_minute?: number | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          headline?: string | null
          id: string
          is_available?: boolean | null
          is_online?: boolean | null
          main_discipline?: string | null
          profile_image_url?: string | null
          review_count?: number | null
          role?: string
          specialties?: string[] | null
          stage_name?: string | null
          status?: string | null
          updated_at?: string | null
          video_price_per_minute?: number | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          call_price_per_minute?: number | null
          chat_price_per_minute?: number | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          main_discipline?: string | null
          profile_image_url?: string | null
          review_count?: number | null
          role?: string
          specialties?: string[] | null
          stage_name?: string | null
          status?: string | null
          updated_at?: string | null
          video_price_per_minute?: number | null
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
        Row: Review
        Insert: {
          client?: Json | null
          client_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          operator?: Json | null
          operator_id: string
          rating: number
        }
        Update: {
          client?: Json | null
          client_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          operator?: Json | null
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
