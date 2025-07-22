import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RegisterForm } from "./register-form"

export default async function RegisterPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Gli utenti già loggati vengono reindirizzati alla homepage
    redirect("/")
  }

  return <RegisterForm />
}
