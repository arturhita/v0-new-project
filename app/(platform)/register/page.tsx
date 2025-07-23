import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/register-form"
import { ConstellationBackground } from "@/components/constellation-background"
import Image from "next/image"

export default async function RegisterPage() {
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gray-950">
      <ConstellationBackground />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center space-y-8 rounded-xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl shadow-black/50 backdrop-blur-sm">
        <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={50} />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Crea il tuo Account</h1>
          <p className="text-gray-400">Unisciti alla nostra community per scoprire cosa ti riserva il futuro.</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
