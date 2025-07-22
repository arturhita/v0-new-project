import { SiteFooter } from "@/components/site-footer"
import { SiteNavbar } from "@/components/site-navbar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type React from "react"

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
    <div className="flex flex-col min-h-screen bg-[#0B112B] text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,60,152,0.3),rgba(255,255,255,0))]"></div>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteNavbar />
        <main className="flex-grow flex items-center justify-center px-4">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
