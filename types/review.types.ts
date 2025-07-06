export type Review = {
  id: string
  user_id: string
  operator_id: string
  rating: number
  comment: string
  created_at: string // ISO 8601 date string
  user_full_name: string
}
