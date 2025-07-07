"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Operator, DetailedOperatorProfile, OperatorCardData, Review } from "@/types/database"

const transformOperatorData = (operator: any, detailed = false): OperatorCardData | DetailedOperatorProfile => {
  const reviewsRaw = operator.reviews || []
  const reviewsCount = reviewsRaw.length
  const averageRating =
    reviewsCount > 0 ? reviewsRaw.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsCount : 0

  const operatorServices = (operator.services || []).map((service: any) => ({
    type: service.type as "chat" | "call" | "email",
    price: service.price_per_minute ?? service.price_per_consultation,
  }))

  const baseData: OperatorCardData = {
    id: operator.id,
    fullName: operator.full_name,
    avatarUrl: operator.avatar_url,
    headline: operator.headline || operator.bio?.substring(0, 100),
    isOnline: operator.is_online,
    specializations: operator.specializations || [],
    averageRating: Number.parseFloat(averageRating.toFixed(1)),
    reviewsCount: reviewsCount,
    services: operatorServices,
    joinedDate: operator.created_at,
    bio: operator.bio,
  }

  if (detailed) {
    const reviews: Review[] = reviewsRaw.map((r: any) => ({
      id: r.id,
      userName: r.client_profile?.full_name ?? "Utente",
      userType: "Utente",
      operatorName: operator.full_name,
      rating: r.rating,
      comment: r.comment,
      date: r.created_at,
    }))

    return {
      ...(operator as Operator),
      ...baseData,
      availability: operator.availability || {},
      reviews: reviews,
      services: operator.services || [],
      reviewsCount: reviewsCount,
      averageRating: Number.parseFloat(averageRating.toFixed(1)),
    }
  }

  return baseData
}

export async function getApprovedOperators(): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operators")
    .select(
      `
      id, full_name, avatar_url, headline, bio, is_online, specializations, created_at,
      services ( type, price_per_minute, price_per_consultation ),
      reviews!operator_id ( rating )
    `,
    )
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error)
    return []
  }
  return data.map((op) => transformOperatorData(op) as OperatorCardData)
}

export async function getOperatorsByCategory(categorySlug: string): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operators")
    .select(
      `
      id, full_name, avatar_url, headline, bio, is_online, specializations, created_at,
      services ( type, price_per_minute, price_per_consultation ),
      reviews!operator_id ( rating )
    `,
    )
    .eq("application_status", "approved")
    .eq("is_visible", true)
    .cs("specializations", `{${categorySlug}}`)

  if (error) {
    console.error(`Error fetching operators for category ${categorySlug}:`, error)
    return []
  }
  return data.map((op) => transformOperatorData(op) as OperatorCardData)
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
      reviews:reviews!operator_id ( *, client_profile:profiles!client_id(full_name) )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }

  return transformOperatorData(data, true) as DetailedOperatorProfile
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

export async function createOperator(formData: any) {
  const supabase = createClient()
  const { services, availability, ...profileData } = formData

  const { data, error } = await supabase
    .from("operators")
    .insert({
      stage_name: profileData.stageName,
      full_name: `${profileData.name} ${profileData.surname}`,
      email: profileData.email,
      phone: profileData.phone,
      bio: profileData.bio,
      categories: profileData.categories,
      specialties: profileData.specialties,
      avatar_url: profileData.avatarUrl,
      application_status: profileData.status,
      commission_rate: Number.parseFloat(profileData.commission),
      is_online: profileData.isOnline,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating operator:", error)
    return { success: false, message: `Errore del database: ${error.message}` }
  }

  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore creato con successo." }
}

export async function updateOperatorByAdmin(operatorId: string, data: Partial<Operator>) {
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
  const supabase = createClient()
  const { error } = await supabase.from("operators").update({ commission_rate: commission }).eq("id", operatorId)

  if (error) {
    return { success: false, message: error.message }
  }
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Commissione aggiornata." }
}

export async function updateOperatorFiscalData(prevState: any, formData: FormData) {
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

export async function updateOperatorStatus(
  operatorId: string,
  isOnline: boolean,
  status: "Online" | "Offline" | "In Pausa",
) {
  const supabase = createClient()

  const { error } = await supabase
    .from("operators")
    .update({ is_online: isOnline, online_status: status, last_seen: new Date().toISOString() })
    .eq("id", operatorId)

  if (error) {
    console.error("Error updating operator status:", error)
    return { success: false, message: error.message }
  }

  revalidatePath(`/(platform)/dashboard/operator`)
  return { success: true, message: "Stato aggiornato." }
}
