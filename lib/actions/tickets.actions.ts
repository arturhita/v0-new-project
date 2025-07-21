"use server"

import { createClient } from "@/lib/supabase/server"

export async function getTickets() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      user:profiles!support_tickets_user_id_fkey(full_name, role),
      assigned_admin:profiles!support_tickets_assigned_to_fkey(full_name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tickets:", error)
    return []
  }

  return data || []
}
