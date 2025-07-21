import { createAdminClient } from "../supabase/admin"

export async function getPayouts() {
  const supabaseAdmin = createAdminClient()
  try {
    const { data, error } = await supabaseAdmin.from("payouts").select("*")

    if (error) {
      console.error("Error fetching payouts:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("Unexpected error fetching payouts:", error)
    return { error: error.message }
  }
}

export async function updatePayoutStatus(id: string, status: string) {
  const supabaseAdmin = createAdminClient()
  try {
    const { data, error } = await supabaseAdmin.from("payouts").update({ status }).eq("id", id).select()

    if (error) {
      console.error("Error updating payout status:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("Unexpected error updating payout status:", error)
    return { error: error.message }
  }
}
