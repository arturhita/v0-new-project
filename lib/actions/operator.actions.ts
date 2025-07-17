"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { operatorSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import type { z } from "zod"

type OperatorData = z.infer<typeof operatorSchema>

export async function createOperator(operator: OperatorData) {
  const supabase = createServerClient()
  const supabaseAdmin = createAdminClient()

  // 1. Validate data with Zod
  const validation = operatorSchema.safeParse(operator)
  if (!validation.success) {
    console.error("Validation errors:", validation.error.flatten().fieldErrors)
    return {
      error: {
        message: "Invalid operator data.",
        errors: validation.error.flatten().fieldErrors,
      },
    }
  }

  const {
    email,
    password,
    full_name,
    stage_name,
    phone,
    bio,
    avatar_url,
    status,
    is_online,
    commission_rate,
    specialties,
    categories,
    chat_enabled,
    chat_price,
    call_enabled,
    call_price,
    video_enabled,
    video_price,
    email_enabled,
    email_price,
    availability,
  } = validation.data

  let userId: string | undefined

  try {
    // 2. Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm email for admin-created users
      user_metadata: {
        role: "operator",
        name: stage_name,
        full_name: full_name,
        avatar_url: avatar_url,
      },
    })

    if (authError) {
      console.error("Error creating user in Auth:", authError)
      return { error: { message: `Auth error: ${authError.message}` } }
    }

    if (!authData.user) {
      return { error: { message: "User could not be created." } }
    }
    userId = authData.user.id

    // 3. Prepare data for RPC call
    const servicesToInsert = [
      { service_type: "chat", price: chat_price, is_active: chat_enabled },
      { service_type: "call", price: call_price, is_active: call_enabled },
      { service_type: "video", price: video_price, is_active: video_enabled },
      { service_type: "written_consultation", price: email_price, is_active: email_enabled },
    ].filter((s) => s.is_active && s.price != null)

    const availabilityData = availability || {}

    // 4. Call the single RPC function to handle profile, services, and availability
    const { error: rpcError } = await supabase.rpc("create_full_operator_profile", {
      p_user_id: userId,
      p_full_name: full_name,
      p_stage_name: stage_name,
      p_phone: phone,
      p_bio: bio,
      p_avatar_url: avatar_url,
      p_status: status || "pending",
      p_is_online: is_online || false,
      p_commission_rate: commission_rate,
      p_specialties: specialties,
      p_categories: categories,
      p_services: servicesToInsert,
      p_availability: availabilityData,
    })

    if (rpcError) {
      console.error("Error calling RPC function:", rpcError)
      // Attempt to delete the user if the profile creation fails to avoid orphaned auth users
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { error: { message: `Database error: ${rpcError.message}` } }
    }

    revalidatePath("/admin/operators")
    return { success: true, message: "Operator created successfully." }
  } catch (e) {
    const error = e as Error
    console.error("Unexpected error in createOperator:", error)
    // If an unexpected error occurs and we have a userId, try to clean up
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    }
    return { error: { message: `Unexpected error: ${error.message}` } }
  }
}

export async function getOperator(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`
            *,
            services:operator_services(*),
            availability:operator_availability(*)
        `)
    .eq("id", userId)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator data:", error)
    return { error }
  }
  return { data }
}
