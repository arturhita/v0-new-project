"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"
import type { Operator } from "@/components/operator-card"

export async function getApprovedOperators(): Promise<Operator[]> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("operators")
    .select(`
      id,
      display_name,
      description,
      is_online,
      profile_image_url,
      average_rating,
      reviews_count,
      joined_at,
      operator_specializations (
        specializations (
          name
        )
      ),
      operator_services (
        service_type,
        price_per_minute,
        price_per_session
      )
    `)
    .eq("status", "approved")
    .order("is_online", { ascending: false })
    .order("average_rating", { ascending: false, nulls: "last" })

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  const operators: Operator[] = data.map((op) => {
    const services: { [key: string]: number } = {}
    op.operator_services.forEach((service) => {
      if (service.service_type === "chat" && service.price_per_minute) {
        services.chatPrice = service.price_per_minute
      }
      if (service.service_type === "call" && service.price_per_minute) {
        services.callPrice = service.price_per_minute
      }
      if (service.service_type === "email" && service.price_per_session) {
        services.emailPrice = service.price_per_session
      }
    })

    return {
      id: op.id,
      name: op.display_name,
      avatarUrl: op.profile_image_url || "/placeholder.svg?width=96&height=96",
      specialization: op.operator_specializations[0]?.specializations?.name || "N/A",
      rating: op.average_rating || 0,
      reviewsCount: op.reviews_count || 0,
      description: op.description || "",
      tags: op.operator_specializations.map((s) => s.specializations.name),
      isOnline: op.is_online,
      services: services,
      joinedDate: op.joined_at,
    }
  })

  return operators
}
