"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Operator, DetailedOperatorProfile } from "@/types/database"

const transformOperatorData = (operator: any): DetailedOperatorProfile => {
  const reviewsRaw = operator.reviews || []
  const reviewsCount = reviewsRaw.length
  const averageRating =
    reviewsCount > 0 ? reviewsRaw.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsCount : 0

  return {
    ...operator,
    reviewsCount,
    averageRating: Number.parseFloat(averageRating.toFixed(1)),
  }
}

export async function getOperatorById(id: string): Promise<DetailedOperatorProfile | null> {
  if (!id) return null
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operators")
    .select(
      `
      *,
      services ( * ),
      reviews ( * )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }

  return transformOperatorData(data)
}

export async function getOperatorByUserId(userId: string): Promise<Operator | null> {
  if (!userId) return null
  const supabase = createClient()
  const { data, error } = await supabase.from("operators").select("*").eq("user_id", userId).single()
  if (error) {
    console.error("Error fetching operator by user ID:", error)
    return null
  }
  return data
}

export async function updateOperatorByAdmin(operatorId: string, data: Partial<Operator>) {
  "use server"
  const supabase = createClient()
  const { error } = await supabase.from("operators").update(data).eq("id", operatorId)

  if (error) {
    return { success: false, message: error.message }
  }
  revalidatePath(`/admin/operators`)
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Operatore aggiornato." }
}

export async function updateOperatorCommissionByAdmin(operatorId: string, commission: number) {
  "use server"
  const supabase = createClient()
  const { error } = await supabase.from("operators").update({ commission_rate: commission }).eq("id", operatorId)

  if (error) {
    return { success: false, message: error.message }
  }
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Commissione aggiornata." }
}

export async function updateOperatorFiscalData(prevState: any, formData: FormData) {
  "use server"

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const operatorData = {
    fiscal_code: formData.get("fiscal_code") as string,
    vat_number: formData.get("vat_number") as string,
    billing_address: formData.get("billing_address") as string,
    billing_city: formData.get("billing_city") as string,
    billing_zip: formData.get("billing_zip") as string,
    billing_country: formData.get("billing_country") as string,
  }

  if (!operatorData.fiscal_code || !operatorData.billing_address) {
    return { success: false, message: "Codice Fiscale e Indirizzo sono obbligatori." }
  }

  const { error } = await supabase.from("operators").update(operatorData).eq("user_id", user.id)

  if (error) {
    console.error("Error updating fiscal data:", error)
    return { success: false, message: `Errore del database: ${error.message}` }
  }

  revalidatePath("/(platform)/dashboard/operator/settings")
  return { success: true, message: "Dati fiscali aggiornati con successo." }
}
