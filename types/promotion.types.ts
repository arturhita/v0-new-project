export interface Promotion {
  id: string
  title: string
  description?: string
  specialPrice: number
  originalPrice: number
  discountPercentage: number
  validDays: string[]
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
