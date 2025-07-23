"use server"
import { createClient } from "@/lib/supabase/server"

export async function getTickets() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      `
            id,
            created_at,
            subject,
            status,
            priority,
            user:profiles (
                full_name,
                email
            )
        `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return data
}
