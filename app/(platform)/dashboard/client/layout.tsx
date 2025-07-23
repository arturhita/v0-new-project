import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type React from "react"
import { ClientDashboardUI } from "./client-dashboard-ui"

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Se per qualche motivo l'utente non ha un profilo o non è un cliente,
  // lo reindirizziamo alla home.
  if (!profile || profile.role !== "client") {
    redirect("/")
  }

  return <ClientDashboardUI>{children}</ClientDashboardUI>
}
