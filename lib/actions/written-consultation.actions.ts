"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitWrittenConsultation(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication required." }

  const rawData = {
    operator_id: formData.get("operator_id"),
    question: formData.get("question"),
  }

  // Basic validation
  if (!rawData.operator_id || !rawData.question) {
    return { error: "Operator and question are required." }
  }

  const { error } = await supabase.from("written_consultations").insert({
    client_id: user.id,
    operator_id: rawData.operator_id as string,
    question: rawData.question as string,
    status: "pending",
  })

  if (error) {
    console.error("Error submitting written consultation:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/client/written-consultations")
  return { success: "Consultation submitted successfully." }
}

export async function getWrittenConsultationsForClient() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("written_consultations")
    .select("*, operator:profiles(full_name, avatar_url)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client consultations:", error)
    return []
  }
  return data
}

export async function getWrittenConsultationsForOperator() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("written_consultations")
    .select("*, client:profiles(full_name, avatar_url)")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operator consultations:", error)
    return []
  }
  return data
}

export async function answerWrittenConsultation(consultationId: string, answer: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication required." }

  const { error } = await supabase
    .from("written_consultations")
    .update({ answer, status: "answered", answered_at: new Date().toISOString() })
    .eq("id", consultationId)
    .eq("operator_id", user.id)

  if (error) {
    console.error("Error answering consultation:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/operator/written-consultations")
  return { success: "Answer submitted successfully." }
}
