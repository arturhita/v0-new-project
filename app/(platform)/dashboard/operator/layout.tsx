import type React from "react"
import Link from "next/link"
import { Home, MessageSquare, Calendar, Briefcase, BarChart2, Settings, User, Wallet, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorStatusToggle } from "@/components/operator-status-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { href: "/dashboard/operator", icon: Home, label: "Dashboard" },
  { href: "/dashboard/operator/internal-messages", icon: MessageSquare, label: "Messaggi" },
  { href: "/dashboard/operator/availability", icon: Calendar, label: "Disponibilità" },
  { href: "/dashboard/operator/consultations-history", icon: Briefcase, label: "Consulti" },
  { href: "/dashboard/operator/earnings", icon: BarChart2, label: "Guadagni" },
  { href: "/dashboard/operator/profile", icon: User, label: "Profilo Pubblico" },
  { href: "/dashboard/operator/payouts", icon: Wallet, label: "Pagamenti" },
  { href: "/dashboard/operator/invoices", icon: FileText, label: "Fatture" },
  { href: "/dashboard/operator/services", icon: Settings, label: "Servizi" },
]

export default async function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_available, full_name, profile_image_url")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "operator") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-64 flex-shrink-0 bg-gray-950 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Avatar>
            <AvatarImage src={profile.profile_image_url || undefined} alt={profile.full_name || "Operatore"} />
            <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{profile.full_name}</p>
            <p className="text-xs text-gray-400">Operatore</p>
          </div>
        </div>

        <OperatorStatusToggle operatorId={user.id} initialIsAvailable={profile.is_available || false} />

        <nav className="mt-8 flex-grow">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  )
}
