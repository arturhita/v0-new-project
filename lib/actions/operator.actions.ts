"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// This action fetches all approved operators from the database.
export async function getAllOperators() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      operator_details (
        stage_name,
        bio,
        specialties
      )
    `,
    )
    .eq("role", "operator")
    .eq("operator_details.status", "approved")

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  // We need to flatten the data structure for easier use in components
  return data.map((profile) => ({
    id: profile.id,
    name: profile.full_name,
    stageName: profile.operator_details[0]?.stage_name,
    bio: profile.operator_details[0]?.bio,
    specialties: profile.operator_details[0]?.specialties,
    avatarUrl: profile.avatar_url,
    // You can add more fields here as needed, like isOnline status
    isOnline: true, // Placeholder
  }))
}

// This action fetches a single operator by their public stage name.
export async function getOperatorByStageName(stageName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_details")
    .select(
      `
      stage_name,
      bio,
      specialties,
      profile:profiles (
        id,
        full_name,
        avatar_url
      ),
      services (
        service_type,
        price,
        is_enabled
      )
    `,
    )
    .eq("stage_name", stageName)
    .eq("status", "approved")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }

  // Flatten the data for the component
  return {
    id: data.profile.id,
    stageName: data.stage_name,
    bio: data.bio,
    specialties: data.specialties,
    avatarUrl: data.profile.avatar_url,
    services: data.services,
    isOnline: true, // Placeholder
  }
}

// Placeholder functions for create/update to be implemented later
export async function createOperator(operatorData: any) {
  console.log("Creating operator:", operatorData)
  // Logic to insert into profiles and operator_details
  return { success: true, message: "Operator created successfully." }
}

export async function updateOperatorCommission(operatorId: string, commission: string) {
  console.log(`Updating commission for ${operatorId} to ${commission}%`)
  // Logic to update operator_details table
  revalidatePath("/admin/operators")
  return { success: true, message: "Commission updated." }
}
