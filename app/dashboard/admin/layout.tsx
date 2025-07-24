import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UserNav } from "@/components/user-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut()
    redirect("/login?error=unauthorized")
  }

  const adminProfile = {
    ...profile,
    email: user.email,
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex h-14 items-center justify-end gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6">
          <UserNav user={adminProfile} />
        </header>
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
