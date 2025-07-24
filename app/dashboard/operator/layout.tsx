import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserNav } from "@/components/user-nav"
import { OperatorMobileSidebar } from "@/components/operator-mobile-sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CreditCard,
  FileText,
  Home,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Star,
  User,
  Clock,
  Trophy,
} from "lucide-react"

export default async function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*, operator_profiles(*)").eq("id", user.id).single()

  if (!profile || profile.role !== "operator") {
    await supabase.auth.signOut()
    redirect("/login?error=unauthorized")
  }

  const operatorProfile = {
    ...profile,
    email: user.email,
    credits: `€${profile.operator_profiles?.earnings?.toFixed(2) || "0.00"}`,
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard/operator", icon: Home },
    { name: "Consulenze", href: "/dashboard/operator/consultations", icon: Calendar },
    { name: "Richieste Chat", href: "/dashboard/operator/chat-requests", icon: Phone },
    { name: "Messaggi", href: "/dashboard/operator/messages", icon: MessageSquare },
    { name: "Email Richieste", href: "/dashboard/operator/email-requests", icon: Mail },
    { name: "Recensioni", href: "/dashboard/operator/reviews", icon: Star },
    { name: "🏆 Premi", href: "/dashboard/operator/rewards", icon: Trophy },
    { name: "Guadagni", href: "/dashboard/operator/earnings", icon: CreditCard },
    { name: "Fatture", href: "/dashboard/operator/invoices", icon: FileText },
    { name: "Disponibilità", href: "/dashboard/operator/availability", icon: Clock },
    { name: "Dati Pagamento", href: "/dashboard/operator/payment-data", icon: CreditCard },
    { name: "Profilo", href: "/dashboard/operator/profile", icon: User },
    { name: "Impostazioni", href: "/dashboard/operator/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <DashboardSidebar navigation={navigation} title="Dashboard Operatore" />
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <OperatorMobileSidebar navigation={navigation} />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Badge className={profile.operator_profiles?.is_online ? "bg-green-500" : "bg-gray-500"}>
                {profile.operator_profiles?.is_online ? "Online" : "Offline"}
              </Badge>
              <UserNav user={operatorProfile} />
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
