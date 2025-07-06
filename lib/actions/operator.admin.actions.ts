"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createOperator(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string
  const username = formData.get("username") as string
  const bio = formData.get("bio") as string
  const costPerMinute = formData.get("cost_per_minute") as string
  const specializationsString = (formData.get("specializations") as string) || ""

  // Divide la stringa per virgola e pulisce gli spazi
  const specializations = specializationsString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (!email || !password || !fullName || !username || !costPerMinute) {
    return { error: "Tutti i campi obbligatori devono essere compilati." }
  }

  // Step 1: Crea l'utente in auth.users usando il client admin per evitare la conferma email
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Conferma automaticamente l'email
    user_metadata: {
      full_name: fullName,
      username: username,
    },
  })

  if (authError || !authData.user) {
    console.error("Error creating user in auth:", authError)
    return { error: `Errore durante la creazione dell'utente: ${authError?.message}` }
  }

  const userId = authData.user.id

  // Step 2: Aggiorna il profilo dell'utente per impostare il ruolo a 'operator'
  // Il trigger handle_new_user avrà già creato un profilo 'client'.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "operator", username, full_name: fullName })
    .eq("id", userId)

  if (profileError) {
    console.error("Error updating profile to operator:", profileError)
    // Pulizia: cancella l'utente se l'aggiornamento del profilo fallisce
    await supabase.auth.admin.deleteUser(userId)
    return { error: `Errore durante l'aggiornamento del profilo a operatore: ${profileError.message}` }
  }

  // Step 3: Crea i dati specifici dell'operatore nella tabella operators
  const { error: operatorError } = await supabase.from("operators").insert({
    id: userId,
    bio,
    specializations,
    cost_per_minute: Number.parseFloat(costPerMinute),
  })

  if (operatorError) {
    console.error("Error creating operator details:", operatorError)
    // Pulizia: cancella l'utente se la creazione dell'operatore fallisce
    await supabase.auth.admin.deleteUser(userId)
    return { error: `Errore durante la creazione dei dettagli operatore: ${operatorError.message}` }
  }

  revalidatePath("/admin/operators")
  redirect("/admin/operators")
}
