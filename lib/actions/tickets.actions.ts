"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getTickets() {
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*, user:profiles(full_name, email)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
  return data
}
