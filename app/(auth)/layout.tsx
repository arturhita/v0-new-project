import type React from "react"
import SiteNavbar from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/" // Fallback to home page if role is unknown or not set
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const redirectUrl = getDashboardUrl(profile?.role)
    return redirect(redirectUrl)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <SiteNavbar />
      <main className="flex-grow flex items-center justify-center">{children}</main>
      <SiteFooter />
    </div>
  )
}
