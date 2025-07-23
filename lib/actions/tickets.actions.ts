"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getTickets() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("support_tickets").select("*, profiles(full_name)")
  if (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
  return data
}
