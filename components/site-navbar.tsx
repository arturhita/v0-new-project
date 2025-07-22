import { createClient } from "@/lib/supabase/server"
import { SiteNavbarClient } from "./site-navbar-client"

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/"
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export async function SiteNavbar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, avatar_url, role").eq("id", user.id).single()
    profile = data
  }

  return <SiteNavbarClient user={user} profile={profile} />
}
