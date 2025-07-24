import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import {
  Home,
  MessageSquare,
  Star,
  CreditCard,
  User,
  Settings,
  Search,
  Calendar,
  Mail,
  Bell,
  SnowflakeIcon as Crystal,
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar" // A new reusable sidebar component

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "user") {
    await supabase.auth.signOut()
    redirect("/login?error=unauthorized")
  }

  const userProfile = {
    ...profile,
    email: user.email,
    credits: `€${profile.credits?.toFixed(2) || "0.00"}`,
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard/user", icon: Home },
    { name: "Cerca Consulenti", href: "/dashboard/user/search", icon: Search },
    { name: "Le Mie Consulenze", href: "/dashboard/user/consultations", icon: Calendar },
    { name: "Messaggi", href: "/dashboard/user/messages", icon: MessageSquare },
    { name: "Email Consulenze", href: "/dashboard/user/email-consultations", icon: Mail },
    { name: "Le Mie Recensioni", href: "/dashboard/user/reviews", icon: Star },
    { name: "Crediti", href: "/dashboard/user/credits", icon: CreditCard },
    { name: "Profilo", href: "/dashboard/user/profile", icon: User },
    { name: "Impostazioni", href: "/dashboard/user/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center space-x-2 mr-8">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Crystal className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              ConsultaPro
            </span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{userProfile.credits}</span>
            </div>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {/* Dynamic notifications count can be added here */}
            </Button>

            <UserNav user={userProfile} />
          </div>
        </div>
      </header>

      <div className="flex">
        <DashboardSidebar navigation={navigation} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
