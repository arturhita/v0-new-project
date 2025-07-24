import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { sanitizeData } from "@/lib/data.utils"
import type { Profile } from "@/types/profile.types"
import OperatorDashboardClient from "./operator-dashboard-client"

export default async function OperatorDashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !rawProfile) {
    console.error("Error fetching profile or profile not found:", error)
    // Redirect to login or an error page, as we can't proceed.
    return redirect("/login?error=profile_not_found")
  }

  if (rawProfile.role !== "operator") {
    // If not an operator, redirect to the client dashboard
    return redirect("/dashboard/client")
  }

  // Sanitize the profile data on the server before passing it to the client component.
  const profile = sanitizeData(rawProfile as Profile)

  // Render the Client Component, passing the safe, sanitized data as props.
  return <OperatorDashboardClient profile={profile} />
}
