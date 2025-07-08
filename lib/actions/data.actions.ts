"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/components/operator-card"
import type { Review } from "@/components/review-card"

export async function getApprovedOperators(): Promise<Operator[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_details")
    .select(
      `
      stage_name,
      bio,
      specialties,
      created_at,
      profiles (
        id,
        avatar_url
      )
    `,
    )
    .eq("status", "approved")
    .limit(8)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }

  return data.map((op: any) => ({
    id: op.profiles.id,
    name: op.stage_name,
    avatarUrl: op.profiles.avatar_url || `/placeholder.svg?width=96&height=96&query=${op.stage_name}`,
    specialization: op.specialties[0] || "Esperto",
    rating: 4.9, // Placeholder
    reviewsCount: 123, // Placeholder
    description: op.bio,
    tags: op.specialties,
    isOnline: true, // Placeholder
    services: { chatPrice: 2.5, callPrice: 3.0 }, // Placeholder
    joinedDate: op.created_at,
  }))
}

const generateTimeAgo = (daysAgo: number, hoursAgo?: number, minutesAgo?: number): string => {
  const date = new Date()
  if (daysAgo > 0) date.setDate(date.getDate() - daysAgo)
  if (hoursAgo) date.setHours(date.getHours() - hoursAgo)
  if (minutesAgo) date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

export async function getRecentReviews(): Promise<Review[]> {
  // In a real app, this would query the 'reviews' table.
  // For now, returning mock data from the server.
  return [
    {
      id: "r1",
      userName: "Giulia R.",
      userType: "Vip",
      operatorName: "Luna Stellare",
      rating: 5,
      comment: "Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza. Mi ha aiutato tantissimo.",
      date: generateTimeAgo(0, 0, 49),
    },
    {
      id: "r2",
      userName: "Marco B.",
      userType: "Utente",
      operatorName: "Maestro Cosmos",
      rating: 5,
      comment: "Un vero professionista. L'analisi del mio tema natale è stata illuminante. Consigliatissimo!",
      date: generateTimeAgo(0, 0, 57),
    },
    {
      id: "r3",
      userName: "Sofia L.",
      userType: "Vip",
      operatorName: "Sage Aurora",
      rating: 4,
      comment:
        "Aurora è molto dolce e intuitiva. Le sue previsioni con le Sibille sono state utili e mi hanno dato conforto.",
      date: generateTimeAgo(0, 1),
    },
  ]
}
