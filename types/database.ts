export interface Service {
  id: string
  operator_id: string
  type: "chat" | "call" | "email"
  price_per_minute?: number
  price_per_consultation?: number
  is_active: boolean
}

export interface Review {
  id: string
  userName: string
  userType: string
  operatorName: string
  rating: number
  comment: string
  date: string
}

export interface Operator {
  id: string
  user_id?: string
  created_at: string
  stage_name: string
  full_name: string
  email: string
  phone?: string
  bio?: string
  avatar_url?: string
  specializations?: string[]
  categories?: string[]
  is_online: boolean
  online_status: "Online" | "Offline" | "In Pausa"
  last_seen?: string
  application_status: "pending" | "approved" | "rejected"
  is_visible: boolean
  commission_rate: number
  // Dati fiscali
  fiscal_code?: string
  vat_number?: string
  billing_address?: string
  billing_city?: string
  billing_zip?: string
  billing_country?: string
}

export interface OperatorCardData {
  id: string
  fullName: string | null
  avatarUrl: string | null
  headline: string | null
  isOnline: boolean
  specializations: string[]
  averageRating: number
  reviewsCount: number
  services: {
    type: "chat" | "call" | "email"
    price: number | null
  }[]
  joinedDate: string
  bio: string | null
}

export interface DetailedOperatorProfile extends Operator {
  availability: Record<string, string[]>
  reviews: Review[]
  services: Service[]
  reviewsCount: number
  averageRating: number
}
