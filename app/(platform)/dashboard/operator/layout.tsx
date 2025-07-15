import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OperatorDashboardLayoutClient from "./OperatorDashboardLayoutClient"

export default async function OperatorDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Devi effettuare l'accesso per visualizzare questa pagina.")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "operator") {
    if (profile?.role === "admin") {
      return redirect("/admin/dashboard")
    }
    return redirect("/dashboard/client")
  }

  return <OperatorDashboardLayoutClient>{children}</OperatorDashboardLayoutClient>
}
