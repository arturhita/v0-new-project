export type Operator = {
  id: string
  name: string
  avatarUrl: string | null
  specialization: string
  rating: number
  reviewsCount: number
  description: string
  tags: string[]
  isOnline: boolean
  services: {
    chatPrice?: number
    callPrice?: number
    emailPrice?: number
  }
  joinedDate?: string
  showNewBadge?: boolean
}
