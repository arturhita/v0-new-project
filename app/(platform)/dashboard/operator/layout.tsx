"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import OperatorStatusToggle from "@/components/operator-status-toggle"

const navItems = [
  { href: "/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/operator/profile", label: "Profilo Pubblico", icon: User },
  { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: Euro },
  { href: "/dashboard/operator/payout-settings", label: "Impostazioni Pagamento", icon: CreditCard },
  { href: "/dashboard/operator/consultations-history", label: "Storico Consulti", icon: Briefcase },
  { href: "/dashboard/operator/internal-messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: BarChart2 },
  { href: "/dashboard/operator/support", label: "Supporto", icon: LifeBuoy },
]

export default function OperatorDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-t-transparent" />
      </div>
    )
  }

  if (!profile || profile.role !== "operator") {
    // Potresti voler reindirizzare o mostrare un messaggio di errore
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Accesso non autorizzato.</div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-900 text-white">
      <aside className="sticky top-0 h-screen w-64 flex-col border-r border-gray-800 bg-gray-900 p-4 hidden md:flex">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-600" />
          <h1 className="text-xl font-bold">Operatore</h1>
        </div>

        {profile && <OperatorStatusToggle operatorId={profile.id} initialIsAvailable={profile.is_available} />}

        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white",
                pathname === item.href && "bg-gray-800 text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
