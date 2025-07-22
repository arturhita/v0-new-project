import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ClientDashboardUI from "./client-dashboard-ui"
import type { ReactNode } from "react"

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  return "/"
}

export default async function ClientDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Devi essere loggato per accedere.")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "client") {
    const targetUrl = getDashboardUrl(profile?.role)
    return redirect(`${targetUrl}?error=Accesso non autorizzato.`)
  }

  return <ClientDashboardUI>{children}</ClientDashboardUI>
}
