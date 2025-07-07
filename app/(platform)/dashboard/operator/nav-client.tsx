"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Calendar, DollarSign, FileText, LifeBuoy, Star, Wallet, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { OperatorStatusToggle } from "@/components/operator-status-toggle"

const navItems = [
  { href: "/dashboard/operator", icon: Home, label: "Dashboard" },
  { href: "/dashboard/operator/profile", icon: User, label: "Gestisci Profilo" },
  { href: "/dashboard/operator/stories", icon: ImageIcon, label: "Gestisci Storie" },
  { href: "/dashboard/operator/availability", icon: Calendar, label: "Disponibilità" },
  { href: "/dashboard/operator/earnings", icon: DollarSign, label: "Guadagni" },
  { href: "/dashboard/operator/payout-settings", icon: Wallet, label: "Impostazioni Pagamento" },
  { href: "/dashboard/operator/consultations-history", icon: FileText, label: "Storico Consulti" },
  { href: "/dashboard/operator/reviews", icon: Star, label: "Recensioni" },
  { href: "/dashboard/operator/support", icon: LifeBuoy, label: "Supporto" },
]

export function OperatorNavClient({ isAvailable }: { isAvailable: boolean }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-gray-700/50">
        <OperatorStatusToggle initialIsAvailable={isAvailable} />
      </div>
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/operator")
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary",
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
