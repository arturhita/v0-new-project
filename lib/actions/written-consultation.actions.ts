"use server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function submitWrittenConsultation(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("written_consultations")
    .insert({
      user_id: user.id,
      operator_id: formData.get("operator_id"),
      question: formData.get("question"),
      status: "pending",
    })
    .select()

  if (error) return { error }
  revalidatePath("/dashboard/client/written-consultations")
  return { data }
}

export async function getWrittenConsultationsForClient() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("written_consultations")
    .select("*, operator:operator_id(full_name)")
    .eq("user_id", user.id)
  return { data, error }
}

export async function getWrittenConsultationsForOperator() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("written_consultations")
    .select("*, client:user_id(full_name)")
    .eq("operator_id", user.id)
  return { data, error }
}

export async function answerWrittenConsultation(consultationId: string, answer: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("written_consultations")
    .update({
      answer,
      status: "answered",
      answered_at: new Date().toISOString(),
    })
    .eq("id", consultationId)
    .select()

  if (error) return { error }
  revalidatePath("/dashboard/operator/written-consultations")
  return { data }
}
