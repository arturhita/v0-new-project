"use server"

import { createClient } from "@/lib/supabase/server"

export async function getClientDashboardStats(userId: string) {
  const supabase = createClient()

  // Mock data for now - in a real app, this would query the database
  return {
    totalConsultations: 15,
    totalSpent: 245.5,
    favoriteOperators: 3,
    averageRating: 4.8,
    walletBalance: 50.0,
    pendingConsultations: 2,
    completedConsultations: 13,
    monthlySpending: 89.5,
  }
}

export async function getFavoriteExperts(userId: string) {
  const supabase = createClient()

  // Mock data for now - in a real app, this would query the favorites table
  return [
    {
      id: "op_luna_stellare",
      name: "Luna Stellare",
      specialization: "Tarocchi e Astrologia",
      rating: 4.9,
      avatar: "/placeholder.svg",
    },
    {
      id: "op_sol_divino",
      name: "Sol Divino",
      specialization: "Cartomanzia",
      rating: 4.7,
      avatar: "/placeholder.svg",
    },
  ]
}

export async function getWalletBalance(userId: string): Promise<number> {
  const supabase = createClient()

  // Mock implementation - in a real app, this would query the wallet/transactions table
  // For now, return a mock balance
  return 50.0
}
