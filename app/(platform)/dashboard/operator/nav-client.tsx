"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Calendar,
  BarChart2,
  LifeBuoy,
  Euro,
  CreditCard,
  FileText,
  PercentSquare,
  Sparkles,
  Shield,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { OperatorStatusToggle } from "@/components/operator-status-toggle"

const navItems = [
  { href: "/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/operator/profile", label: "Profilo Pubblico", icon: User },
  { href: "/dashboard/operator/stories", label: "Gestisci Storie", icon: Sparkles },
  { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: Euro },
  { href: "/dashboard/operator/payout-settings", label: "Impostazioni Pagamento", icon: CreditCard },
  { href: "/dashboard/operator/commission-request", label: "Richiesta Commissione", icon: PercentSquare },
  { href: "/dashboard/operator/consultations-history", label: "Storico Consulti", icon: FileText },
  { href: "/dashboard/operator/internal-messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/operator/invoices", label: "Fatture", icon: FileText },
  { href: "/dashboard/operator/tax-info", label: "Dati Fiscali", icon: Shield },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: BarChart2 },
  { href: "/dashboard/operator/support", label: "Supporto", icon: LifeBuoy },
]

export function OperatorNavClient({ operatorId }: { operatorId: string }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pb-4 border-b dark:border-gray-800">
        <OperatorStatusToggle operatorId={operatorId} />
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const fullPath = `/platform${item.href}`
          const isActive =
            pathname === fullPath || (pathname.startsWith(fullPath) && fullPath !== "/platform/dashboard/operator")
          return (
            <Link
              key={item.label}
              href={`/platform${item.href}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-primary dark:text-gray-400 dark:hover:text-white",
                isActive && "bg-gray-100 text-primary dark:bg-gray-800 dark:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
