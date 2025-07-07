import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OperatorNavClient from "./nav-client"
import { Toaster } from "@/components/ui/toaster"

export default async function OperatorDashboardLayout({
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

  if (!profile || profile.role !== "operator") {
    // O reindirizza a una pagina di "non autorizzato"
    redirect("/")
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <OperatorNavClient />
      <main className="flex-1 p-6 sm:p-8 md:p-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <Toaster />
    </div>
  )
}
