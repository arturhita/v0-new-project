import type React from "react"
import { NavClient } from "./nav-client"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"

export default async function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role, is_available").eq("id", user.id).single()

  if (!profile || profile.role !== "operator") {
    redirect("/")
  }

  return (
    <OperatorStatusProvider initialAvailability={profile.is_available ?? false}>
      <div className="flex min-h-screen w-full bg-gray-50">
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Dashboard Operatore</h1>
          </div>
          <NavClient operatorId={user.id} />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </OperatorStatusProvider>
  )
}
