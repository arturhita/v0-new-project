import { getOperators } from "@/lib/actions/operator.actions"
import { HomeClient } from "./home-client"
import type { Operator as OperatorCardType } from "@/components/operator-card"
import type { Review as ReviewCardType } from "@/components/review-card"

// Mock data can be removed or kept for testing, but it's no longer the primary source.
const today = new Date()
const fiveDaysAgo = new Date(today)
fiveDaysAgo.setDate(today.getDate() - 5)
const twelveDaysAgo = new Date(today)
twelveDaysAgo.setDate(today.getDate() - 12)

export const mockOperators: OperatorCardType[] = [
  {
    id: "1",
    name: "Luna Stellare",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Cartomante & Tarocchi",
    rating: 4.9,
    reviewsCount: 256,
    description: "Esperta in letture di tarocchi con 15 anni di esperienza, ti guiderà con chiarezza.",
    tags: ["Tarocchi", "Amore", "Lavoro", "Cartomante", "Cartomanzia"],
    isOnline: true,
    services: { chatPrice: 2.5, callPrice: 2.5 },
    joinedDate: twelveDaysAgo.toISOString(),
  },
]

const generateTimeAgo = (daysAgo: number, hoursAgo?: number, minutesAgo?: number): string => {
  const date = new Date()
  if (daysAgo > 0) date.setDate(date.getDate() - daysAgo)
  if (hoursAgo) date.setHours(date.getHours() - hoursAgo)
  if (minutesAgo) date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

export const allMockReviews: ReviewCardType[] = [
  {
    id: "r1",
    userName: "Giulia R.",
    userType: "Vip",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza. Mi ha aiutato tantissimo.",
    date: generateTimeAgo(0, 0, 49),
  },
]

export default async function HomePage() {
  const operators = await getOperators({ limit: 8 })

  return <HomeClient initialOperators={operators} />
}
