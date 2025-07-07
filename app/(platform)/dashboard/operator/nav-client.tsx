"use client"

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
  FileText,
  PercentSquare,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/operator/profile", label: "Profilo Pubblico", icon: User },
  { href: "/dashboard/operator/stories", label: "Gestisci Storie", icon: Sparkles },
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

export function OperatorNavClient() {
  const pathname = usePathname()

  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-brand-blue-900",
            pathname === item.href && "bg-brand-blue-800 text-white",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </>
  )
}
