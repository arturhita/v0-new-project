import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export interface OperatorApplication {
  id: string
  user_id: string
  status: "pending" | "approved" | "rejected"
  phone: string
  bio: string
  specializations: string[]
  cv_url: string | null
  created_at: string
  profile: {
    name: string | null
    email: string | null
  } | null
}

export async function getOperatorApplications(): Promise<OperatorApplication[]> {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase
    .from("operator_applications")
    .select(
      `
      id,
      user_id,
      status,
      phone,
      bio,
      specializations,
      cv_url,
      created_at,
      profile:profiles (
        name,
        email
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching applications:", error.message)
    throw new Error(`Error fetching applications: ${error.message}`)
  }

  // Supabase types can be tricky with relations. We cast to ensure type safety.
  return data as OperatorApplication[]
}

export async function approveApplication(applicationId: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc("approve_operator_application", {
    p_application_id: applicationId,
    p_user_id: userId,
  })

  if (error) {
    console.error("Error approving application:", error)
    return { success: false, message: error.message }
  }
  return { success: true, message: "Application approved successfully." }
}

export async function rejectApplication(applicationId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc("reject_operator_application", {
    p_application_id: applicationId,
  })

  if (error) {
    console.error("Error rejecting application:", error)
    return { success: false, message: error.message }
  }
  return { success: true, message: "Application rejected successfully." }
}
