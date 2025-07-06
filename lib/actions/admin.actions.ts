"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Tipo per i dati delle candidature che leggeremo dal DB
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

export async function getOperatorApplications(): Promise<{
  applications: ApplicationWithProfile[] | null
  error: string | null
}> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

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
    console.error("Error fetching applications:", error)
    return { applications: null, error: "Impossibile recuperare le candidature." }
  }

  // Supabase aggiunge un livello extra 'profiles' che vogliamo rimuovere per semplicità
  const applications = data.map((app) => ({
    ...app,
    // @ts-ignore
    profile: Array.isArray(app.profiles) ? app.profiles[0] : app.profiles,
  }))

  return { applications: data as ApplicationWithProfile[], error: null }
}

export async function approveApplication(applicationId: string, userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { error } = await supabase.rpc("approve_operator_application", {
    p_application_id: applicationId,
    p_user_id: userId,
  })

  if (error) {
    console.error("Error approving application:", error)
    return { success: false, message: "Errore durante l'approvazione." }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Candidatura approvata con successo." }
}

export async function rejectApplication(applicationId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { error } = await supabase.rpc("reject_operator_application", {
    p_application_id: applicationId,
  })

  if (error) {
    console.error("Error rejecting application:", error)
    return { success: false, message: "Errore durante il rifiuto della candidatura." }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Candidatura rifiutata." }
}
