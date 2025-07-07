// Tipi che rispecchiano il nuovo schema del database (001-master-schema.sql)

export type UserRole = "client" | "operator" | "admin"
export type ApplicationStatus = "pending" | "approved" | "rejected"
export type ServiceType = "chat" | "call" | "written"
export type ConsultationStatus = "requested" | "accepted" | "in_progress" | "completed" | "canceled" | "refunded"
export type TransactionType = "recharge" | "consultation_payment" | "payout" | "refund"

export interface Profile {
  id: string // UUID from auth.users
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string | null

  // Client-specific
  wallet_balance: number

  // Operator-specific
  headline: string | null
  bio: string | null
  specializations: string[] | null
  is_online: boolean
  online_status: string | null
  application_status: ApplicationStatus
  is_visible: boolean
  commission_rate: number
  fiscal_code: string | null
  vat_number: string | null
  billing_address: string | null
}

export interface Service {
  id: number
  operator_id: string
  type: ServiceType
  price_per_minute: number | null
  price_per_consultation: number | null
  is_active: boolean
  created_at: string
}

export interface Review {
  id: number
  client_id: string
  operator_id: string
  consultation_id: number | null
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  // Joined data
  client_profile?: { full_name: string | null }
}

// Questo tipo è per le card degli operatori mostrate nelle liste
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
    type: ServiceType
    price: number | null
  }[]
}

// Questo tipo è per la pagina di dettaglio del profilo operatore
export interface DetailedOperatorProfile extends Profile {
  services: Service[]
  reviews: Review[]
  averageRating: number
  reviewsCount: number
}
