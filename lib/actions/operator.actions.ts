"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface OperatorProfile {
  id: string
  full_name: string
  stage_name: string
  email: string
  phone?: string
  avatar_url?: string
  bio?: string
  specialties: string[]
  categories: string[]
  services: {
    chat?: { enabled: boolean; price_per_minute: number }
    call?: { enabled: boolean; price_per_minute: number }
    email?: { enabled: boolean; price: number }
  }
  availability: any
  is_online: boolean
  status: string
  average_rating: number
  reviews_count: number
  created_at: string
  updated_at: string
}

export async function getOperatorProfile(operatorId?: string) {
  const supabase = createClient()

  try {
    let userId = operatorId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      userId = user.id
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).eq("role", "operator").single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching operator profile:", error)
    return null
  }
}

export async function updateOperatorProfile(profileData: {
  full_name?: string
  stage_name?: string
  phone?: string
  avatar_url?: string
  bio?: string
  specialties?: string[]
  categories?: string[]
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

    revalidatePath("/dashboard/operator/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating operator profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function updateOperatorServices(services: {
  chat?: { enabled: boolean; price_per_minute: number }
  call?: { enabled: boolean; price_per_minute: number }
  email?: { enabled: boolean; price: number }
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
        services,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/dashboard/operator/services")
    return { success: true }
  } catch (error) {
    console.error("Error updating operator services:", error)
    return { success: false, error: "Failed to update services" }
  }
}

export async function updateOperatorAvailability(availability: any) {
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
        availability,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/dashboard/operator/availability")
    return { success: true }
  } catch (error) {
    console.error("Error updating operator availability:", error)
    return { success: false, error: "Failed to update availability" }
  }
}

export async function setOperatorOnlineStatus(isOnline: boolean) {
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
        is_online: isOnline,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/dashboard/operator")
    return { success: true }
  } catch (error) {
    console.error("Error updating online status:", error)
    return { success: false, error: "Failed to update online status" }
  }
}

export async function getAllOperators() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "operator")
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching all operators:", error)
    return []
  }
}

export async function updateOperatorStatus(operatorId: string, status: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", operatorId)
      .eq("role", "operator")

    if (error) throw error

    revalidatePath("/admin/operators")
    return { success: true }
  } catch (error) {
    console.error("Error updating operator status:", error)
    return { success: false, error: "Failed to update operator status" }
  }
}

export async function createOperator(operatorData: {
  email: string
  password: string
  full_name: string
  stage_name: string
  phone?: string
  bio?: string
  specialties: string[]
  categories: string[]
}) {
  const supabase = createClient()

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: operatorData.email,
      password: operatorData.password,
      email_confirm: true,
    })

    if (authError) throw authError

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: operatorData.full_name,
        stage_name: operatorData.stage_name,
        phone: operatorData.phone,
        bio: operatorData.bio,
        specialties: operatorData.specialties,
        categories: operatorData.categories,
        role: "operator",
        status: "Pending",
      })
      .eq("id", authData.user.id)

    if (profileError) throw profileError

    revalidatePath("/admin/operators")
    return { success: true, operator: authData.user }
  } catch (error) {
    console.error("Error creating operator:", error)
    return { success: false, error: "Failed to create operator" }
  }
}

export async function deleteOperator(operatorId: string) {
  const supabase = createClient()

  try {
    // Delete from auth (this will cascade to profiles due to trigger)
    const { error } = await supabase.auth.admin.deleteUser(operatorId)

    if (error) throw error

    revalidatePath("/admin/operators")
    return { success: true }
  } catch (error) {
    console.error("Error deleting operator:", error)
    return { success: false, error: "Failed to delete operator" }
  }
}

export async function getOperatorStats(operatorId?: string) {
  const supabase = createClient()

  try {
    let userId = operatorId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      userId = user.id
    }

    // Get various stats in parallel
    const [chatSessions, callSessions, writtenConsultations, reviews] = await Promise.all([
      supabase.from("chat_sessions").select("total_cost, status").eq("operator_id", userId),
      supabase.from("call_sessions").select("cost, status").eq("operator_id", userId),
      supabase.from("written_consultations").select("cost, status").eq("operator_id", userId),
      supabase.from("reviews").select("rating").eq("operator_id", userId).eq("status", "approved"),
    ])

    const totalChatSessions = chatSessions.data?.length || 0
    const totalCallSessions = callSessions.data?.length || 0
    const totalWrittenConsultations = writtenConsultations.data?.length || 0
    const totalReviews = reviews.data?.length || 0

    const totalEarnings = [
      ...(chatSessions.data || []).filter((s) => s.status === "ended").map((s) => s.total_cost || 0),
      ...(callSessions.data || []).filter((s) => s.status === "completed").map((s) => s.cost || 0),
      ...(writtenConsultations.data || []).filter((s) => s.status === "answered").map((s) => s.cost || 0),
    ].reduce((sum, cost) => sum + cost, 0)

    const averageRating =
      totalReviews > 0 ? (reviews.data || []).reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0

    return {
      totalChatSessions,
      totalCallSessions,
      totalWrittenConsultations,
      totalReviews,
      totalEarnings,
      averageRating: Math.round(averageRating * 10) / 10,
    }
  } catch (error) {
    console.error("Error fetching operator stats:", error)
    return null
  }
}
