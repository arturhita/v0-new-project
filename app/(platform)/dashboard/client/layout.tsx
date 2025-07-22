import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientDashboardUI } from "./client-dashboard-ui"
import type { ReactNode } from "react"

export default async function ClientDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Devi essere loggato per accedere.")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    console.error("Error fetching client profile:", error)
    // This could happen if the profile wasn't created correctly.
    // Log out the user and redirect to login with an error message.
    await supabase.auth.signOut()
    return redirect("/login?message=Errore nel caricamento del profilo. Effettua nuovamente il login.")
  }

  if (profile.role !== "client") {
    const targetUrl = profile.role === "admin" ? "/admin" : profile.role === "operator" ? "/dashboard/operator" : "/"
    return redirect(`${targetUrl}?error=Accesso non autorizzato.`)
  }

  return <ClientDashboardUI profile={profile}>{children}</ClientDashboardUI>
}
