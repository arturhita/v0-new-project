import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorNavClient } from "./nav-client"
import { Toaster } from "@/components/ui/sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
    .select("role, full_name, profile_image_url")
    .eq("id", user.id)
    .single()

  if (error || !profile || profile.role !== "operator") {
    return redirect("/")
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <aside className="sticky top-0 h-screen w-72 flex-shrink-0 flex-col border-r border-gray-200 bg-white p-4 hidden md:flex">
        <div className="mb-6 flex items-center gap-3 px-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/images/moonthir-logo.png" width={32} height={32} alt="Moonthir Logo" />
            <span className="text-lg text-gray-800">Moonthir</span>
          </Link>
        </div>
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-100 p-3">
          <Avatar className="h-11 w-11 border-2 border-indigo-500">
            <AvatarImage src={profile.profile_image_url || undefined} alt={profile.full_name || "Operatore"} />
            <AvatarFallback className="bg-indigo-500 text-white">
              {profile.full_name?.charAt(0).toUpperCase() || <User />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">{profile.full_name}</p>
            <p className="text-sm text-gray-500">Operatore</p>
          </div>
        </div>
        <OperatorNavClient operatorId={user.id} />
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mx-auto max-w-7xl">{children}</div>
        <Toaster richColors />
      </main>
    </div>
  )
}
