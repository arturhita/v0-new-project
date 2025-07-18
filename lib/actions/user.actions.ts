"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUsersForAdmin() {
  const supabase = createClient()
  // We query our public profiles table instead of auth.users
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      created_at
    `,
    )
    .eq("role", "client")

  if (error) {
    console.error("Error fetching users for admin:", error)
    return []
  }

  return data
}
