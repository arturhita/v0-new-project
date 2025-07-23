import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RegisterForm } from "./register-form"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"

export default async function RegisterPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/") // Redirect to home if already logged in
  }

  return (
    <div className="w-full flex-grow flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-md">
        <GoldenConstellationBackground />
        <div className="relative z-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
