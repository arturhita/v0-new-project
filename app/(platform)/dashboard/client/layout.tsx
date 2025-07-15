import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import Link from "next/link"
import { Home, Wallet, Briefcase, Mail, MessageSquare, Star, LifeBuoy, UserCircle } from "lucide-react"

const clientNavItems = [
  { href: "/dashboard/client", label: "Panoramica", icon: Home },
  { href: "/dashboard/client/wallet", label: "Il Mio Wallet", icon: Wallet },
  { href: "/dashboard/client/consultations", label: "Storico Consulenze", icon: Briefcase },
  { href: "/dashboard/client/written-consultations", label: "Consulti Scritti", icon: Mail },
  { href: "/dashboard/client/messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/client/reviews", label: "Le Mie Recensioni", icon: Star },
  { href: "/dashboard/client/support", label: "Supporto", icon: LifeBuoy },
  { href: "/profile", label: "Il Mio Profilo", icon: UserCircle },
]

export default async function ClientDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "client" && profile?.role !== "admin") {
    redirect("/")
  }

  const sidebarHeader = (
    <Link href="/dashboard/client" className="flex items-center gap-2.5 font-bold text-white text-lg">
      <span>Dashboard</span>
    </Link>
  )

  const linkClasses = {
    base: "text-gray-700 hover:bg-blue-100 hover:text-blue-700",
    active: "bg-blue-600 text-white shadow-md font-semibold",
    inactive: "",
    icon: "text-gray-400",
    iconActive: "text-white",
  }

  return (
    <DashboardLayout
      menuItems={clientNavItems}
      sidebarHeader={sidebarHeader}
      sidebarHeaderClasses="bg-gradient-to-br from-blue-600 to-blue-700 border-gray-200"
      sidebarLinkClasses={linkClasses}
    >
      {children}
    </DashboardLayout>
  )
}
