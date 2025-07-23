import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type React from "react"

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Devi essere loggato per accedere.")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Allow both clients and admins to see the client dashboard
  if (profile?.role !== "client" && profile?.role !== "admin") {
    return redirect("/login?message=Accesso non autorizzato.")
  }

  return <>{children}</>
}
