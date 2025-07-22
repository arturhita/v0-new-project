import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import RegisterForm from "./register-form"

export default async function RegisterPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Users who are already signed in should be redirected away from the registration page.
    redirect("/")
  }

  return <RegisterForm />
}
