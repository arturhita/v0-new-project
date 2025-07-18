"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUsersForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`id, full_name, email, created_at, status`)
    .eq("role", "client")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return data
}
