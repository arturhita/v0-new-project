"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Profile } from "@/types/profile.types"

// Funzione di utilità per sanificare i dati, trasformandoli in oggetti JavaScript puri.
function sanitizeData<T>(data: T): T {
  if (!data) return data
  return JSON.parse(JSON.stringify(data))
}

export async function getOperatorDashboardData(): Promise<Profile | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.error("Errore nel recuperare il profilo operatore:", error?.message)
    return null
  }

  // **LA SOLUZIONE**: Sanifichiamo i dati subito dopo averli recuperati e prima di restituirli.
  // Questo garantisce che il componente client riceva un oggetto sicuro e modificabile.
  return sanitizeData(profile)
}
