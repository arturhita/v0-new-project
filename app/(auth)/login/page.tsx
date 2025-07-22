import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    const role = profile?.role
    if (role === "admin") {
      return redirect("/admin")
    } else if (role === "operator") {
      return redirect("/dashboard/operator")
    } else if (role === "client") {
      return redirect("/dashboard/client")
    } else {
      // Fallback se l'utente esiste ma non ha un ruolo o un profilo
      return redirect("/")
    }
  }

  // Se non c'è un utente, renderizza il componente client del form.
  return <LoginForm />
}
