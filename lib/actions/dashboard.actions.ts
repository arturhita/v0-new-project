"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { type Profile } from "@/types/profile.types"

// Funzione di utilità per sanificare i dati
function sanitizeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

export async function getOperatorDashboardData() {
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

  // Sanificazione dei dati prima di restituirli
  return sanitizeData(profile as Profile)
}

export async function getClientDashboardData() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.error("Errore nel recuperare il profilo cliente:", error?.message)
    return null
  }

  // Sanificazione dei dati prima di restituirli
  return sanitizeData(profile as Profile)
}
