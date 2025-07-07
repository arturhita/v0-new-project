import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorNavClient } from "./nav-client"
import { Toaster } from "sonner"
import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OperatorStatusToggle } from "@/components/operator-status-toggle"

export default async function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, is_available, full_name, profile_image_url")
    .eq("id", user.id)
    .single()

  if (error || !profile || profile.role !== "operator") {
    return redirect("/")
  }

  return (
    <div className="flex min-h-screen w-full bg-brand-blue-950 text-gray-200">
      <aside className="sticky top-0 h-screen w-72 flex-col border-r border-brand-blue-900 bg-brand-blue-950/50 p-6 hidden md:flex">
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-brand-blue-700">
            <AvatarImage src={profile.profile_image_url || undefined} alt={profile.full_name || "Operatore"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile.full_name?.charAt(0).toUpperCase() || <User />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg text-white">{profile.full_name}</p>
            <p className="text-sm text-primary">Operatore</p>
          </div>
        </div>

        <OperatorStatusToggle operatorId={user.id} initialIsAvailable={profile.is_available ?? false} />

        <nav className="mt-8 flex flex-col gap-2">
          <OperatorNavClient />
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10 bg-brand-blue-950 overflow-y-auto">
        <div className="mx-auto max-w-7xl">{children}</div>
        <Toaster />
      </main>
    </div>
  )
}
