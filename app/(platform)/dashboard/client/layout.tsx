import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ClientDashboardUI from "./client-dashboard-ui"

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Devi essere loggato per accedere.")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Permettiamo l'accesso sia ai client che agli admin (che potrebbero voler vedere la dashboard del cliente)
  if (profile?.role !== "client" && profile?.role !== "admin") {
    return redirect("/?error=Accesso non autorizzato.")
  }

  return <ClientDashboardUI>{children}</ClientDashboardUI>
}
