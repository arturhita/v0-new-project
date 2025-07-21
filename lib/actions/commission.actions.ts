import { createAdminClient } from "../supabase/admin"

export async function getCommissionRequests() {
  const supabaseAdmin = createAdminClient()

  try {
    const { data, error } = await supabaseAdmin
      .from("commission_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching commission requests:", error)
      return { data: [], error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error fetching commission requests:", error)
    return { data: [], error: "Failed to fetch commission requests" }
  }
}

export async function updateCommissionRequestStatus(id: string, status: string) {
  const supabaseAdmin = createAdminClient()

  try {
    const { data, error } = await supabaseAdmin.from("commission_requests").update({ status }).eq("id", id).select()

    if (error) {
      console.error("Error updating commission request status:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error updating commission request status:", error)
    return { data: null, error: "Failed to update commission request status" }
  }
}
