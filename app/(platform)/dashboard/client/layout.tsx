import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ClientDashboardLayoutClient from "./ClientDashboardLayoutClient"

export default async function ClientDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Devi effettuare l'accesso per visualizzare questa pagina.")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "client") {
    if (profile?.role === "admin") {
      return redirect("/admin/dashboard")
    } else if (profile?.role === "operator") {
      return redirect("/dashboard/operator")
    }
    return redirect("/login?message=Accesso non autorizzato.")
  }

  return <ClientDashboardLayoutClient>{children}</ClientDashboardLayoutClient>
}
