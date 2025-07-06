"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createOperator(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const username = formData.get("username") as string
  const bio = formData.get("bio") as string
  const costPerMinute = formData.get("costPerMinute") as string
  const specializations = formData.getAll("specializations") as string[]

  if (!email || !password || !fullName || !username) {
    return { error: "Email, password, nome completo e username sono obbligatori." }
  }

  // 1. Crea l'utente in auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
      },
    },
  })

  if (authError || !authData.user) {
    console.error("Errore creazione utente in Auth:", authError)
    return { error: authError?.message || "Impossibile creare l'utente." }
  }

  const userId = authData.user.id

  // 2. Aggiorna il ruolo in profiles a 'operator'
  const { error: profileError } = await supabase.from("profiles").update({ role: "operator" }).eq("id", userId)

  if (profileError) {
    console.error("Errore aggiornamento profilo:", profileError)
    // Potenziale rollback manuale dell'utente auth
    return { error: "Impossibile aggiornare il ruolo del profilo." }
  }

  // 3. Inserisci i dati nella tabella operators
  const { error: operatorError } = await supabase.from("operators").insert({
    id: userId,
    bio,
    cost_per_minute: Number.parseFloat(costPerMinute),
    specializations,
  })

  if (operatorError) {
    console.error("Errore inserimento operatore:", operatorError)
    // Potenziale rollback manuale
    return { error: "Impossibile creare i dati dell'operatore." }
  }

  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore creato con successo." }
}
