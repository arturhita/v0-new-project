import { ConstellationBackground } from "@/components/constellation-background"
import { LoginForm } from "@/components/login-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role === "admin") redirect("/admin")
    if (profile?.role === "operator") redirect("/dashboard/operator")
    if (profile?.role === "client") redirect("/dashboard/client")
    redirect("/")
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">
            Bentornato
          </h1>
          <p className="text-gray-400 mt-2">Accedi per continuare il tuo viaggio.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
