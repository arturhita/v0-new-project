"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface User {
  id: string
  email: string
  full_name: string
  stage_name?: string
  role: "client" | "operator" | "admin"
  status: string
  is_online: boolean
  wallet_balance: number
  created_at: string
  updated_at: string
  last_sign_in_at?: string
}

export async function getAllUsers() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching all users:", error)
    return []
  }
}

export async function getUserById(userId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }
}

export async function updateUserRole(userId: string, role: "client" | "operator" | "admin") {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) throw error

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Failed to update user role" }
  }
}

export async function updateUserStatus(userId: string, status: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) throw error

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user status:", error)
    return { success: false, error: "Failed to update user status" }
  }
}

export async function deleteUser(userId: string) {
  const supabase = createClient()

  try {
    // Delete user from auth (this will cascade to profiles)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) throw error

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function createUser(userData: {
  email: string
  password: string
  full_name: string
  role: "client" | "operator" | "admin"
  stage_name?: string
}) {
  const supabase = createClient()

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    })

    if (authError) throw authError

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: userData.full_name,
        role: userData.role,
        stage_name: userData.stage_name,
        status: "Attivo",
      })
      .eq("id", authData.user.id)

    if (profileError) throw profileError

    revalidatePath("/admin/users")
    return { success: true, user: authData.user }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function getUserStats() {
  const supabase = createClient()

  try {
    const [totalUsers, totalClients, totalOperators, totalAdmins, activeUsers, newUsersThisMonth] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "operator"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_online", true),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    return {
      totalUsers: totalUsers.count || 0,
      totalClients: totalClients.count || 0,
      totalOperators: totalOperators.count || 0,
      totalAdmins: totalAdmins.count || 0,
      activeUsers: activeUsers.count || 0,
      newUsersThisMonth: newUsersThisMonth.count || 0,
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      totalUsers: 0,
      totalClients: 0,
      totalOperators: 0,
      totalAdmins: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
    }
  }
}

export async function searchUsers(query: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,stage_name.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error searching users:", error)
    return []
  }
}

export async function updateUserWalletBalance(userId: string, amount: number, description?: string) {
  const supabase = createClient()

  try {
    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", userId)
      .single()

    if (profileError) throw profileError

    const currentBalance = profile?.wallet_balance || 0
    const newBalance = currentBalance + amount

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        wallet_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) throw updateError

    // Record transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      user_id: userId,
      amount,
      transaction_type: amount > 0 ? "credit" : "debit",
      description: description || (amount > 0 ? "Admin credit" : "Admin debit"),
    })

    if (transactionError) throw transactionError

    revalidatePath("/admin/users")
    return { success: true, newBalance }
  } catch (error) {
    console.error("Error updating user wallet balance:", error)
    return { success: false, error: "Failed to update wallet balance" }
  }
}
