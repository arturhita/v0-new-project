export interface Operator {
  id: string
  user_id: string
  stage_name: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  bio: string | null
  avatar_url: string | null
  categories: string[] | null
  specialties: string[] | null
  application_status: "pending" | "approved" | "rejected"
  commission_rate: number
  is_online: boolean
  online_status: "Online" | "Offline" | "In Pausa"
  created_at: string
  // Dati Fiscali
  fiscal_code: string | null
  vat_number: string | null
  billing_address: string | null
  billing_city: string | null
  billing_zip: string | null
  billing_country: string | null
}

// Tipo esteso per il profilo dettagliato, usato nelle pagine profilo e admin
export interface DetailedOperatorProfile extends Operator {
  availability: Record<string, any>
  reviews: any[]
  services: any[]
  reviewsCount: number
  averageRating: number
}
