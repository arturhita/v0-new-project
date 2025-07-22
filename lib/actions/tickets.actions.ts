"use server"

import { createClient } from "@/lib/supabase/server"

export async function getTickets() {
  const supabase = createClient()
  // This is a mock implementation. Replace with real data from your 'tickets' table.
  const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
  return data
}
