import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LoginForm } from "./login-form"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"

export default async function LoginPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const role = profile?.role
    if (role === "admin") redirect("/admin")
    if (role === "operator") redirect("/dashboard/operator")
    if (role === "client") redirect("/dashboard/client")
    redirect("/") // Fallback
  }

  return (
    <div className="w-full flex-grow flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <GoldenConstellationBackground />
        <div className="relative z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
