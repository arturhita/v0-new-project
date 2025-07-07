import type React from "react"
import {
  LayoutDashboard,
  User,
  Calendar,
  MessageSquare,
  Briefcase,
  BarChart2,
  LifeBuoy,
  Euro,
  CreditCard,
  FileText,
  PercentSquare,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OperatorStatusToggle from "@/components/operator-status-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NavClient } from "./nav-client"

const navItems = [
  { href: "/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/operator/profile", label: "Profilo Pubblico", icon: User },
  { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: Euro },
  { href: "/dashboard/operator/payout-settings", label: "Impostazioni Pagamento", icon: CreditCard },
  { href: "/dashboard/operator/commission-request", label: "Richiesta Commissione", icon: PercentSquare },
  { href: "/dashboard/operator/consultations-history", label: "Storico Consulti", icon: Briefcase },
  { href: "/dashboard/operator/internal-messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/operator/invoices", label: "Fatture", icon: FileText },
  { href: "/dashboard/operator/tax-info", label: "Dati Fiscali", icon: Briefcase },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: BarChart2 },
  { href: "/dashboard/operator/support", label: "Supporto", icon: LifeBuoy },
]

export default async function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, is_available, full_name, profile_image_url")
    .eq("id", user.id)
    .single()

  if (error || !profile || profile.role !== "operator") {
    // Se non è un operatore, o c'è un errore, reindirizza
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-950 text-gray-200">
      <aside className="sticky top-0 h-screen w-72 flex-col border-r border-gray-800 bg-gray-900 p-6 hidden md:flex">
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.profile_image_url || undefined} alt={profile.full_name || "Operatore"} />
            <AvatarFallback className="bg-indigo-600 text-white">
              {profile.full_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg text-white">{profile.full_name}</p>
            <p className="text-sm text-indigo-400">Operatore</p>
          </div>
        </div>

        <OperatorStatusToggle operatorId={user.id} initialIsAvailable={profile.is_available ?? false} />

        <nav className="mt-8 flex flex-col gap-2">
          <NavClient navItems={navItems} />
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
