import type React from "react"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "client") {
      redirect("/") // Reindirizza se non è un cliente
    }
  } else {
    redirect("/login?message=Sessione non valida.")
  }

  return <>{children}</>
}
