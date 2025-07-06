import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorProfileForm } from "@/components/operator-profile-form"
import type { UserProfile } from "@/types/user.types"

export default async function OperatorProfilePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.error("Failed to fetch operator profile:", error)
    // Potresti mostrare una pagina di errore qui invece di un semplice div
    return <div>Impossibile caricare il profilo. Riprova più tardi.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-8 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
            Il Mio Altare Mistico
          </span>
        </h1>
        {/* Passiamo i dati iniziali del profilo al componente client */}
        <OperatorProfileForm profile={profile as UserProfile} />
      </div>
    </div>
  )
}
