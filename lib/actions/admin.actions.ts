"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ApplicationWithProfile = {
  id: string
  created_at: string
  status: "pending" | "approved" | "rejected"
  phone: string
  bio: string
  specializations: string[]
  cv_url: string | null
  user_id: string
  profiles: {
    name: string | null
    email: string | null
  } | null
}

export async function getOperatorApplications(): Promise<ApplicationWithProfile[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("operator_applications")
    .select(
      `
      id,
      created_at,
      status,
      phone,
      bio,
      specializations,
      cv_url,
      user_id,
      profiles (
        name,
        email
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching applications from Supabase:", error)
    throw new Error(`Errore nel recupero delle candidature. Dettagli: ${error.message}`)
  }

  return data as ApplicationWithProfile[]
}

export async function approveApplication(applicationId: string, userId: string) {
  const supabase = createClient()

  const { error } = await supabase.rpc("approve_operator_application", {
    p_application_id: applicationId,
    p_user_id: userId,
  })

  if (error) {
    console.error("Error approving application:", error)
    return { success: false, message: `Errore durante l'approvazione: ${error.message}` }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Candidatura approvata con successo." }
}

export async function rejectApplication(applicationId: string) {
  const supabase = createClient()

  const { error } = await supabase.rpc("reject_operator_application", {
    p_application_id: applicationId,
  })

  if (error) {
    console.error("Error rejecting application:", error)
    return { success: false, message: `Errore durante il rifiuto: ${error.message}` }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Candidatura rifiutata." }
}
