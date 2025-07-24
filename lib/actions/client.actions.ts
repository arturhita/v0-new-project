"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Operator } from "@/types/operator.types"

export async function getClientDashboardStats(userId: string) {
  noStore()
  const supabase = createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const profilePromise = supabase.from("profiles").select("wallet_balance").eq("id", userId).single()

  const consultationsPromise = supabase
    .from("consultations")
    .select("id", { count: "exact", head: true })
    .eq("client_id", userId)
    .gte("created_at", thirtyDaysAgo.toISOString())

  // Assumendo che esista una tabella 'messages' con questa struttura
  const messagesPromise = supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("is_read", false)

  const [
    { data: profile, error: profileError },
    { count: recentConsultationsCount, error: consultationsError },
    { count: unreadMessagesCount, error: messagesError },
  ] = await Promise.all([profilePromise, consultationsPromise, messagesPromise])

  if (profileError || consultationsError || messagesError) {
    console.error("Error fetching client dashboard stats:", { profileError, consultationsError, messagesError })
    return {
      recentConsultationsCount: 0,
      unreadMessagesCount: 0,
      walletBalance: 0,
    }
  }

  return {
    recentConsultationsCount: recentConsultationsCount ?? 0,
    unreadMessagesCount: unreadMessagesCount ?? 0,
    walletBalance: profile?.wallet_balance ?? 0,
  }
}

export async function getFavoriteExperts(userId: string): Promise<Operator[]> {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
      operator:profiles (
        id,
        stage_name,
        avatar_url,
        is_online,
        specialties
      )
    `,
    )
    .eq("client_id", userId)
    .limit(5)

  if (error) {
    console.error("Error fetching favorite experts:", error)
    return []
  }

  if (!data) {
    return []
  }

  const favoriteExperts: Operator[] = data
    .map((fav) => {
      const expertProfile = fav.operator
      if (!expertProfile) return null

      return {
        id: expertProfile.id,
        name: expertProfile.stage_name || "N/A",
        avatarUrl: expertProfile.avatar_url || "/placeholder.svg",
        isOnline: expertProfile.is_online || false,
        specialization: (expertProfile.specialties && expertProfile.specialties[0]) || "Specialista",
        profileLink: `/operator/${expertProfile.stage_name}`,
      }
    })
    .filter((expert): expert is Operator => expert !== null)

  return favoriteExperts
}
