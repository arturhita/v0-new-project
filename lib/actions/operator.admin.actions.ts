"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createOperator(prevState: any, formData: FormData) {
  const supabase = createClient()
  const supabaseAdmin = createAdminClient()

  // Verifica se l'utente corrente è un admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Autenticazione richiesta." }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Autorizzazione negata." }

  // Estrai i dati dal form
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const username = formData.get("username") as string
  const bio = formData.get("bio") as string
  const costPerMinute = formData.get("costPerMinute") as string

  if (!email || !password || !fullName || !username) {
    return { error: "Email, password, nome completo e username sono obbligatori." }
  }

  // 1. Crea l'utente in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // L'utente non dovrà confermare l'email
    user_metadata: { full_name: fullName },
  })

  if (authError) {
    console.error("Errore creazione utente Auth:", authError)
    return { error: `Errore durante la creazione dell'utente: ${authError.message}` }
  }

  const newUserId = authData.user.id

  // 2. Aggiorna il profilo dell'utente per impostare il ruolo 'operator'
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "operator", username, full_name: fullName })
    .eq("id", newUserId)

  if (profileError) {
    console.error("Errore aggiornamento profilo:", profileError)
    // Potresti voler eliminare l'utente appena creato in auth se questo passaggio fallisce
    return { error: "Errore durante l'aggiornamento del profilo utente." }
  }

  // 3. Crea il record nella tabella 'operators'
  const { error: operatorError } = await supabase.from("operators").insert({
    id: newUserId,
    bio,
    cost_per_minute: Number.parseFloat(costPerMinute) || 0,
  })

  if (operatorError) {
    console.error("Errore creazione operatore:", operatorError)
    return { error: "Errore durante la creazione dei dati operatore." }
  }

  revalidatePath("/admin/operators")
  redirect("/admin/operators")
}
