"use server"
import createServerClient from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitWrittenConsultation(operatorId: string, question: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("written_consultations").insert({
    client_id: user.id,
    operator_id: operatorId,
    question,
    status: "pending",
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/client/written-consultations")
  return { success: true }
}

export async function getWrittenConsultationsForClient() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from("written_consultations")
    .select("*, operator:operator_id(full_name)")
    .eq("client_id", user.id)
  if (error) return []
  return data
}

export async function getWrittenConsultationsForOperator() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from("written_consultations")
    .select("*, client:client_id(full_name)")
    .eq("operator_id", user.id)
  if (error) return []
  return data
}

export async function answerWrittenConsultation(consultationId: string, answer: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("written_consultations")
    .update({ answer, status: "answered", answered_at: new Date().toISOString() })
    .eq("id", consultationId)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/operator/written-consultations")
  return { success: true }
}
