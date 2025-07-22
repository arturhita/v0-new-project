import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { ClientDashboardUI } from "./client-dashboard-ui"

export default async function ClientDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Devi essere loggato per accedere.")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Redirect if the user is not a client
  if (profile?.role !== "client") {
    if (profile?.role === "admin") return redirect("/admin")
    if (profile?.role === "operator") return redirect("/dashboard/operator")
    return redirect("/")
  }

  return (
    <div className="flex min-h-full w-full">
      <ClientDashboardUI />
      <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  )
}
