"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/register-form"
import { ConstellationBackground } from "@/components/constellation-background"

async function checkUserAndRedirect() {
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
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? "Creazione Account..." : "Registrati"}
    </button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(checkUserAndRedirect, undefined)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(state.success)
      // Il redirect a /login dopo la registrazione è corretto.
      // L'utente effettuerà il login per la prima volta.
      router.push("/login")
    }
  }, [state, router])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">
            Crea il tuo Account
          </h1>
          <p className="text-gray-400 mt-2">Inizia il tuo viaggio con noi oggi stesso.</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
