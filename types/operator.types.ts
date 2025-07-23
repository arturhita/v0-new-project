export interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  client: {
    full_name: string
    avatar_url: string | null
  }
  operator: {
    stage_name: string
  }
}

export interface OperatorProfile {
  id: string
  full_name: string
  stage_name: string
  profile_picture_url: string | null
  specialties: string[] | null
  is_online: boolean
  services_offered: string[] | null
  bio: string | null
  availability: any[] | null
  reviews: Review[] | null
  phone_consult_rate: number | null
  chat_consult_rate: number | null
  written_consult_rate: number | null
}
