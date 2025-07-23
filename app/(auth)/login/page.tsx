import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "./login-form"
import { ConstellationBackground } from "@/components/constellation-background"

export default async function LoginPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role === "admin") {
      redirect("/admin")
    } else if (profile?.role === "operator") {
      redirect("/dashboard/operator")
    } else {
      redirect("/dashboard/client")
    }
  }

  return (
    <div className="relative flex-grow flex items-center justify-center p-4 overflow-hidden">
      <ConstellationBackground />
      <div className="w-full max-w-md z-10">
        <LoginForm />
      </div>
    </div>
  )
}
