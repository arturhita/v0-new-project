"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function registerOperator(prevState: any, formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const stageName = formData.get("stageName") as string
  const bio = formData.get("bio") as string
  const categories = formData.getAll("categories") as string[]

  if (password !== confirmPassword) {
    return { success: false, message: "Le password non coincidono." }
  }

  if (password.length < 6) {
    return { success: false, message: "La password deve essere di almeno 6 caratteri." }
  }

  if (!stageName) {
    return { success: false, message: "Il nome d'arte è obbligatorio." }
  }

  if (categories.length === 0) {
    return { success: false, message: "Seleziona almeno una categoria." }
  }

  const {
    data: { user },
    error: signUpError,
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // L'utente viene creato come già verificato
    user_metadata: {
      stage_name: stageName,
      full_name: stageName,
      role: "operator",
    },
  })

  if (signUpError) {
    console.error("Operator SignUp Error:", signUpError)
    if (signUpError.message.includes("User already exists")) {
      return { success: false, message: "Un utente con questa email è già registrato." }
    }
    return { success: false, message: `Errore durante la registrazione: ${signUpError.message}` }
  }

  if (!user) {
    return { success: false, message: "Impossibile creare l'utente. Riprova." }
  }

  // Il trigger su auth.users ha creato un profilo. Ora lo aggiorniamo.
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      stage_name: stageName,
      bio: bio,
      categories: categories,
      status: "Attivo",
      is_online: false,
      services: {
        chat: { enabled: true, price_per_minute: 2.0 },
        call: { enabled: false, price_per_minute: 2.5 },
        email: { enabled: false, price: 20.0 },
      },
      availability: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
    })
    .eq("id", user.id)

  if (profileError) {
    console.error("Operator Profile Update Error:", profileError)
    // Se l'aggiornamento del profilo fallisce, eliminiamo l'utente per evitare dati orfani.
    await supabaseAdmin.auth.admin.deleteUser(user.id)
    return {
      success: false,
      message: `Errore nell'aggiornamento del profilo: ${profileError.message}. Registrazione annullata.`,
    }
  }

  revalidatePath("/(platform)/esperti", "layout")
  redirect("/login?registration=success") // Reindirizza alla pagina di login
}
