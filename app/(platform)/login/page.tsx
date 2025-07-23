import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConstellationBackground } from "@/components/constellation-background"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"

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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center space-y-8 rounded-xl bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={50} />
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bentornato</h1>
          <p className="text-gray-400">Accedi per continuare il tuo viaggio mistico.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
