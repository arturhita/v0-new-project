"use client"
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
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Redirect if not an operator
  if (profile?.role !== "operator") {
    if (profile?.role === "admin") {
      redirect("/admin/dashboard")
    } else {
      redirect("/dashboard/client")
    }
  }

  return <OperatorDashboardLayoutClient>{children}</OperatorDashboardLayoutClient>
}
