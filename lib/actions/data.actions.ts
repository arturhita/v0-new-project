import { createClient } from "@/utils/supabase/server"

export async function getHomepageData() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profile:profiles!inner(id, full_name, avatar_url)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reviews:", error)
      return { data: [], error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error fetching reviews:", error)
    return { data: [], error: { message: "Unexpected error" } }
  }
}
