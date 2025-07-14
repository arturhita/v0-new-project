"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function registerOperator(prevState: any, formData: FormData) {
  const supabase = createClient()
  const origin = headers().get("origin")

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

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        stage_name: stageName,
        full_name: stageName, // Placeholder, can be updated later
        role: "operator",
      },
    },
  })

  if (signUpError) {
    console.error("SignUp Error:", signUpError)
    if (signUpError.message.includes("User already registered")) {
      return { success: false, message: "Un utente con questa email è già registrato." }
    }
    return { success: false, message: `Errore durante la registrazione: ${signUpError.message}` }
  }

  if (!signUpData.user) {
    return { success: false, message: "Impossibile creare l'utente. Riprova." }
  }

  // The trigger should have created a profile. Now we update it.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      stage_name: stageName,
      bio: bio,
      categories: categories,
      status: "Attivo", // Make them visible immediately as requested
      is_online: false, // Default to offline
      // Set some default services and prices
      services: {
        chat: { enabled: true, price_per_minute: 2.0 },
        call: { enabled: false, price_per_minute: 2.5 },
        email: { enabled: false, price: 20.0 },
      },
      // Set default empty availability
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
    .eq("id", signUpData.user.id)

  if (profileError) {
    console.error("Profile Update Error:", profileError)
    // In a real app, you might want to delete the auth user here if the profile update fails.
    return {
      success: false,
      message: `Utente creato, ma errore nell'aggiornamento del profilo: ${profileError.message}`,
    }
  }

  revalidatePath("/(platform)/operator") // Revalidate the operators list page
  revalidatePath("/(platform)/esperti") // Revalidate the experts list page

  // Redirect to a page that tells them to check their email
  redirect("/registrazione-operatore/conferma")
}
