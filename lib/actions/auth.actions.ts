"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email e password sono obbligatori." }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "Credenziali non valide." }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  revalidatePath("/", "layout")

  if (profile?.role === "admin") {
    redirect("/admin")
  } else if (profile?.role === "operator") {
    redirect("/dashboard/operator")
  } else {
    redirect("/dashboard/client")
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email e password sono obbligatori." }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error("Signup Error:", error)
    return { error: "Impossibile registrare l'utente." }
  }

  revalidatePath("/", "layout")
  // Potresti reindirizzare a una pagina che dice "Controlla la tua email per confermare"
  redirect("/login?message=check-email")
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
