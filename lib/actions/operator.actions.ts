"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"
import { revalidatePath } from "next/cache"

// DB type: The raw data structure returned by Supabase, including the nested reviews array.
type OperatorFromDB = Database["public"]["Tables"]["profiles"]["Row"] & {
  services: Array<Database["public"]["Tables"]["services"]["Row"]>
  reviews: Array<{ rating: number }>
}

// Component type: The data structure the component expects, with calculated values.
export type OperatorCardData = Database["public"]["Tables"]["profiles"]["Row"] & {
  services: Array<Database["public"]["Tables"]["services"]["Row"]>
  averageRating: number
  reviewsCount: number
}

// Helper function to transform raw DB data into the structure needed by components.
function transformOperatorData(operators: OperatorFromDB[]): OperatorCardData[] {
  if (!operators) {
    return []
  }
  return operators.map((op) => {
    const reviewsCount = op.reviews?.length ?? 0
    const averageRating = reviewsCount > 0 ? op.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsCount : 0

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reviews, ...rest } = op

    return {
      ...rest,
      averageRating,
      reviewsCount,
    }
  })
}

export type CreateOperatorData = {
  name: string
  surname: string
  stageName: string
  email: string
  phone: string
  bio: string
  specialties: string[]
  categories: string[]
  services: {
    chatEnabled: boolean
    chatPrice: string
    callEnabled: boolean
    callPrice: string
    emailEnabled: boolean
    emailPrice: string
  }
  commission: string
}

export async function createOperator(operatorData: CreateOperatorData) {
  const supabase = createClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: operatorData.email,
    password: "default-password-change-me",
    email_confirm: true,
    user_metadata: {
      full_name: `${operatorData.name} ${operatorData.surname}`,
    },
  })

  if (authError) {
    console.error("Auth Error:", authError)
    return { success: false, message: `Errore Auth: ${authError.message}` }
  }

  const userId = authData.user.id

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: "operator",
      full_name: operatorData.stageName,
      bio: operatorData.bio,
      specializations: operatorData.categories,
      phone_number: operatorData.phone,
      commission_rate: Number.parseFloat(operatorData.commission),
      application_status: "approved",
      is_visible: true,
    })
    .eq("id", userId)

  if (profileError) {
    console.error("Profile Error:", profileError)
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, message: `Errore Profilo: ${profileError.message}` }
  }

  const servicesToInsert = []
  if (operatorData.services.chatEnabled) {
    servicesToInsert.push({
      operator_id: userId,
      type: "chat" as const,
      price_per_minute: Number.parseFloat(operatorData.services.chatPrice),
      is_active: true,
    })
  }
  if (operatorData.services.callEnabled) {
    servicesToInsert.push({
      operator_id: userId,
      type: "call" as const,
      price_per_minute: Number.parseFloat(operatorData.services.callPrice),
      is_active: true,
    })
  }
  if (operatorData.services.emailEnabled) {
    servicesToInsert.push({
      operator_id: userId,
      type: "written" as const,
      price_per_consultation: Number.parseFloat(operatorData.services.emailPrice),
      is_active: true,
    })
  }

  if (servicesToInsert.length > 0) {
    const { error: servicesError } = await supabase.from("services").insert(servicesToInsert)

    if (servicesError) {
      console.error("Services Error:", servicesError)
      await supabase.auth.admin.deleteUser(userId)
      return { success: false, message: `Errore Servizi: ${servicesError.message}` }
    }
  }

  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore creato con successo." }
}

export async function getApprovedOperators(): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*), reviews(rating)")
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error.message)
    throw new Error(`Error fetching approved operators: ${error.message}`)
  }

  return transformOperatorData(data as OperatorFromDB[])
}

export async function getOperatorsByCategory(category: string): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*), reviews(rating)")
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)
    .contains("specializations", [category])

  if (error) {
    console.error("Error fetching operators by category:", error.message)
    throw new Error(`Error fetching operators by category: ${error.message}`)
  }

  return transformOperatorData(data as OperatorFromDB[])
}

export async function getOperatorById(operatorId: string): Promise<OperatorCardData | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*), reviews(rating)")
    .eq("id", operatorId)
    .eq("role", "operator")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching operator by ID:", error.message)
    throw new Error(`Error fetching operator by ID: ${error.message}`)
  }
  if (!data) return null

  const transformed = transformOperatorData([data as OperatorFromDB])
  return transformed[0]
}
