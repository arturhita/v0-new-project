"use server"

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

// Recupera tutti gli operatori approvati per la visualizzazione pubblica
export async function getAllOperators() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_details")
    .select(
      `
      stage_name,
      bio,
      specialties,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("status", "approved")

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data.map((op) => ({
    id: op.profiles.id,
    stageName: op.stage_name,
    bio: op.bio,
    specialties: op.specialties,
    avatarUrl: op.profiles.avatar_url,
    isOnline: true, // Placeholder
  }))
}

// Recupera un singolo operatore tramite il suo nome d'arte per la pagina profilo
export async function getOperatorByStageName(stageName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_details")
    .select(
      `
      stage_name,
      bio,
      specialties,
      profiles (
        id,
        full_name,
        avatar_url
      ),
      services (
        service_type,
        price,
        is_enabled
      )
    `,
    )
    .eq("stage_name", stageName)
    .eq("status", "approved")
    .single()

  if (error || !data) {
    console.error(`Error fetching operator by stage name "${stageName}":`, error)
    notFound()
  }

  return {
    id: data.profiles.id,
    stageName: data.stage_name,
    fullName: data.profiles.full_name,
    bio: data.bio,
    specialties: data.specialties,
    avatarUrl: data.profiles.avatar_url,
    services: data.services,
    isOnline: true, // Placeholder
  }
}

// Recupera un singolo operatore tramite il suo ID per i pannelli di amministrazione
export async function getOperatorById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      avatar_url,
      role,
      operator_details (
        stage_name,
        bio,
        specialties,
        status,
        commission_rate
      ),
      services (
        service_type,
        price,
        is_enabled
      )
    `,
    )
    .eq("id", id)
    .eq("role", "operator")
    .single()

  if (error || !data) {
    console.error(`Error fetching operator with ID ${id}:`, error)
    notFound()
  }

  // Appiattisce i dati per un uso più semplice nei form
  const operatorDetails = data.operator_details[0] || {}
  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    avatarUrl: data.avatar_url,
    role: data.role,
    stageName: operatorDetails.stage_name,
    bio: operatorDetails.bio,
    specialties: operatorDetails.specialties,
    status: operatorDetails.status,
    commissionRate: operatorDetails.commission_rate,
    services: data.services,
  }
}
