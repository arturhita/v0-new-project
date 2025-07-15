"use server"

import { createServerClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function signUpAsOperator(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const supabase = createServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Pass user metadata to the server
      data: {
        full_name: fullName,
        role: "operator",
      },
      // Operators do not need to confirm their email to start
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Operator SignUp Error:", error.message)
    return redirect("/diventa-esperto?message=Could not authenticate user")
  }

  // Redirect to a page that informs the operator their application is under review
  return redirect("/diventa-esperto?message=Registrazione completata. Il tuo profilo è in attesa di approvazione.")
}
