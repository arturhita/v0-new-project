import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConstellationBackground } from "@/components/constellation-background"
import { RegisterForm } from "@/components/register-form"
import Image from "next/image"

export default async function RegisterPage() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    return redirect("/auth/callback")
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-900 p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-yellow-500/20 bg-gray-950/50 p-8 shadow-2xl shadow-yellow-500/10 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={50} className="mb-6" />
          <h1 className="text-3xl font-bold text-white">Crea il tuo Account</h1>
          <p className="mt-2 text-gray-300/70">Inizia il tuo viaggio con noi.</p>
        </div>
        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
