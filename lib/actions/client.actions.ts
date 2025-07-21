"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ClientProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  wallet_balance: number
  created_at: string
  updated_at: string
}

export async function getClientProfile(clientId?: string) {
  const supabase = createClient()

  try {
    let userId = clientId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      userId = user.id
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).eq("role", "client").single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching client profile:", error)
    return null
  }
}

export async function updateClientProfile(profileData: {
  full_name?: string
  phone?: string
  avatar_url?: string
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating client profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function getClientWalletBalance(clientId?: string) {
  const supabase = createClient()

  try {
    let userId = clientId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return 0
      userId = user.id
    }

    const { data, error } = await supabase.from("profiles").select("wallet_balance").eq("id", userId).single()

    if (error) throw error

    return data?.wallet_balance || 0
  } catch (error) {
    console.error("Error fetching wallet balance:", error)
    return 0
  }
}

export async function addToWallet(amount: number, description?: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single()

    if (profileError) throw profileError

    const currentBalance = profile?.wallet_balance || 0
    const newBalance = currentBalance + amount

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", user.id)

    if (updateError) throw updateError

    // Record transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      amount,
      transaction_type: "credit",
      description: description || "Wallet recharge",
    })

    if (transactionError) throw transactionError

    revalidatePath("/dashboard/client/wallet")
    return { success: true, newBalance }
  } catch (error) {
    console.error("Error adding to wallet:", error)
    return { success: false, error: "Failed to add funds to wallet" }
  }
}

export async function deductFromWallet(
  amount: number,
  description?: string,
  referenceId?: string,
  referenceType?: string,
) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single()

    if (profileError) throw profileError

    const currentBalance = profile?.wallet_balance || 0

    if (currentBalance < amount) {
      return { success: false, error: "Insufficient wallet balance" }
    }

    const newBalance = currentBalance - amount

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", user.id)

    if (updateError) throw updateError

    // Record transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      amount: -amount,
      transaction_type: "debit",
      description: description || "Service payment",
      reference_id: referenceId,
      reference_type: referenceType,
    })

    if (transactionError) throw transactionError

    revalidatePath("/dashboard/client/wallet")
    return { success: true, newBalance }
  } catch (error) {
    console.error("Error deducting from wallet:", error)
    return { success: false, error: "Failed to deduct from wallet" }
  }
}

export async function getWalletTransactions(clientId?: string) {
  const supabase = createClient()

  try {
    let userId = clientId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      userId = user.id
    }

    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching wallet transactions:", error)
    return []
  }
}

export async function getFavoriteOperators(clientId?: string) {
  const supabase = createClient()

  try {
    let userId = clientId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      userId = user.id
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        *,
        operator:profiles!favorites_operator_id_fkey(*)
      `)
      .eq("client_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((fav) => fav.operator).filter(Boolean)
  } catch (error) {
    console.error("Error fetching favorite operators:", error)
    return []
  }
}

export async function addToFavorites(operatorId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase.from("favorites").insert({
      client_id: user.id,
      operator_id: operatorId,
    })

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return { success: false, error: "Operator already in favorites" }
      }
      throw error
    }

    revalidatePath("/dashboard/client")
    return { success: true }
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return { success: false, error: "Failed to add to favorites" }
  }
}

export async function removeFromFavorites(operatorId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase.from("favorites").delete().eq("client_id", user.id).eq("operator_id", operatorId)

    if (error) throw error

    revalidatePath("/dashboard/client")
    return { success: true }
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return { success: false, error: "Failed to remove from favorites" }
  }
}

export async function getClientStats(clientId?: string) {
  const supabase = createClient()

  try {
    let userId = clientId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      userId = user.id
    }

    // Get various stats in parallel
    const [chatSessions, callSessions, writtenConsultations, walletTransactions, favorites] = await Promise.all([
      supabase.from("chat_sessions").select("cost").eq("client_id", userId),
      supabase.from("call_sessions").select("cost").eq("client_id", userId),
      supabase.from("written_consultations").select("cost").eq("client_id", userId),
      supabase.from("wallet_transactions").select("amount").eq("user_id", userId),
      supabase.from("favorites").select("id").eq("client_id", userId),
    ])

    const totalChatSessions = chatSessions.data?.length || 0
    const totalCallSessions = callSessions.data?.length || 0
    const totalWrittenConsultations = writtenConsultations.data?.length || 0
    const totalFavorites = favorites.data?.length || 0

    const totalSpent = [
      ...(chatSessions.data || []),
      ...(callSessions.data || []),
      ...(writtenConsultations.data || []),
    ].reduce((sum, session) => sum + (session.cost || 0), 0)

    const totalDeposited = (walletTransactions.data || [])
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalChatSessions,
      totalCallSessions,
      totalWrittenConsultations,
      totalFavorites,
      totalSpent,
      totalDeposited,
    }
  } catch (error) {
    console.error("Error fetching client stats:", error)
    return null
  }
}
