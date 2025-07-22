"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getTickets() {
  const { data, error } = await supabaseAdmin.from("support_tickets").select("*, user:user_id(full_name, email)")
  if (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
  return data
}
