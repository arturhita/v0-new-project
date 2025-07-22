import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoginForm } from "./login-form"

// Questo è ora un PURO Componente Server. Non c'è "use client".
export default async function LoginPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    const role = profile?.role
    if (role === "admin") {
      redirect("/admin")
    } else if (role === "operator") {
      redirect("/dashboard/operator")
    } else if (role === "client") {
      redirect("/dashboard/client")
    } else {
      // Fallback se l'utente esiste ma non ha un ruolo o un profilo
      redirect("/")
    }
  }

  // Se non c'è un utente, renderizza il componente client del form.
  return <LoginForm />
}
