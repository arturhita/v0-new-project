"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function requestCommissionChange(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const requestData = {
    operator_id: user.id,
    current_commission: Number(formData.get("current_commission")),
    requested_commission: Number(formData.get("requested_commission")),
    reason: formData.get("reason") as string,
    status: "pending",
  }

  const { error } = await supabase.from("commission_requests").insert(requestData)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/operator/dashboard/commission-request")
  return { success: true, message: "Richiesta inviata con successo." }
}

export async function getCommissionRequests() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from("commission_requests")
    .select(
      `
      *,
      profile:profiles(full_name)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
  return data
}

export async function updateCommissionRequestStatus(requestId: string, status: "approved" | "rejected") {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from("commission_requests").update({ status }).eq("id", requestId)

  if (error) {
    return { success: false, message: error.message }
  }

  // Here you might want to also update the operator's actual commission rate in the 'profiles' table if approved.

  revalidatePath("/admin/commission-requests-log")
  return { success: true, message: `Richiesta ${status === "approved" ? "approvata" : "rifiutata"}.` }
}
