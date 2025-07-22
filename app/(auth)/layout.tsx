import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/" // Fallback to home page if role is unknown or not set
}

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    const redirectUrl = getDashboardUrl(profile?.role)
    console.log(`[AuthLayout] User is already logged in. Redirecting to ${redirectUrl}`)
    return redirect(redirectUrl)
  }

  return <>{children}</>
}
