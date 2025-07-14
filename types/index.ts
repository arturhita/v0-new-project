export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Profile = {
  id: string
  updated_at?: string | null
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  website?: string | null
  role?: "user" | "operator" | "admin"
  name?: string | null
  surname?: string | null
  stage_name?: string | null
  phone?: string | null
  bio?: string | null
  status?: "Attivo" | "In Attesa" | "Sospeso"
  is_online?: boolean
  commission_rate?: number | null
  services?: Json | null
  availability?: Json | null
  specialties?: string[] | null
  categories?: string[] | null
  email?: string | null
}
