"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getOperatorById(operatorId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", operatorId)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator:", error)
    return null
  }

  return data
}

export async function registerOperator(operatorData: {
  email: string
  password: string
  fullName: string
  stageName: string
  bio: string
  categories: string[]
  services: any
}) {
  const supabase = createAdminClient()

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: operatorData.email,
      password: operatorData.password,
      user_metadata: {
        full_name: operatorData.fullName,
        role: "operator",
      },
    })

    if (authError) throw authError

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: operatorData.fullName,
        stage_name: operatorData.stageName,
        bio: operatorData.bio,
        categories: operatorData.categories,
        services: operatorData.services,
        status: "In Attesa di Approvazione",
      })
      .eq("id", authData.user.id)
      .select()
      .single()

    if (profileError) throw profileError

    return { success: true, operator: profile }
  } catch (error) {
    console.error("Error registering operator:", error)
    return { success: false, error: "Failed to register operator" }
  }
}

export async function getAllOperators() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data || []
}

export async function getOperatorPublicProfile(stageName: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      reviews(
        id,
        rating,
        comment,
        created_at,
        user_id
      )
    `)
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .eq("status", "Attivo")
    .single()

  if (error) {
    console.error("Error fetching operator profile:", error)
    return null
  }

  return data
}

export async function createOperator(operatorData: {
  fullName: string
  stageName: string
  email: string
  bio: string
  categories: string[]
  services: any
}) {
  const supabase = createAdminClient()

  try {
    // Create auth user with temporary password
    const tempPassword = Math.random().toString(36).slice(-8)

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: operatorData.email,
      password: tempPassword,
      user_metadata: {
        full_name: operatorData.fullName,
        role: "operator",
      },
    })

    if (authError) throw authError

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: operatorData.fullName,
        stage_name: operatorData.stageName,
        bio: operatorData.bio,
        categories: operatorData.categories,
        services: operatorData.services,
        status: "Attivo",
      })
      .eq("id", authData.user.id)
      .select()
      .single()

    if (profileError) throw profileError

    return { success: true, operator: profile, tempPassword }
  } catch (error) {
    console.error("Error creating operator:", error)
    return { success: false, error: "Failed to create operator" }
  }
}
