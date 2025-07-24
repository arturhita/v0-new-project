import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData, error } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (error || !userData) {
    // Handle error or user not found in users table.
    // This could happen if a user is created in auth but not in the public.users table.
    // Redirecting to the user dashboard is a safe fallback.
    console.error("Error fetching user role, redirecting to user dashboard:", error)
    redirect("/dashboard/user")
  }

  switch (userData.role) {
    case "admin":
      redirect("/dashboard/admin")
    case "operator":
      redirect("/dashboard/operator")
    case "user":
      redirect("/dashboard/user")
    default:
      // Fallback for any other roles or if role is null
      redirect("/dashboard/user")
  }
}
