export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: string
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
          commission_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role?: string
          // ... add other fields
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: string
          // ... add other fields
        }
      }
      // ... altre tabelle
    }
    Views: {
      // ... viste
    }
    Functions: {
      // ... funzioni
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
