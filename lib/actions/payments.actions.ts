"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAdminTransactions() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      user:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
  return data
}
