import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientDashboardUI } from "./client-dashboard-ui"

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?message=Devi essere loggato per accedere.")
  }

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()

  if (!profile || profile.role !== "client") {
    redirect("/login?message=Accesso non autorizzato.")
  }

  return <ClientDashboardUI userName={profile.full_name}>{children}</ClientDashboardUI>
}
