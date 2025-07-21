import { createAdminClient } from "../supabase/admin"

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabaseAdmin = createAdminClient()
  try {
    const { data, error } = await supabaseAdmin.from("applications").update({ status }).eq("id", applicationId).select()

    if (error) {
      console.error("Error updating application status:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("Unexpected error updating application status:", error)
    return { error: error.message }
  }
}
