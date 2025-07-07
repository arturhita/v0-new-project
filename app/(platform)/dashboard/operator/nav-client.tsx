"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  Calendar,
  BarChart2,
  Settings,
  MessageSquare,
  FileText,
  Shield,
  BookOpen,
  Percent,
  LifeBuoy,
  Camera,
} from "lucide-react"
import { cn } from "@/lib/utils"
import OperatorStatusToggle from "@/components/operator-status-toggle"

const navItems = [
  { href: "/(platform)/dashboard/operator/profile", label: "Profilo e Servizi", icon: User },
  { href: "/(platform)/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/(platform)/dashboard/operator/stories", label: "Storie", icon: Camera },
  { href: "/(platform)/dashboard/operator/earnings", label: "Guadagni", icon: BarChart2 },
  { href: "/(platform)/dashboard/operator/payout-settings", label: "Impostazioni Pagamento", icon: Settings },
  { href: "/(platform)/dashboard/operator/commission-request", label: "Richiesta Commissione", icon: Percent },
  { href: "/(platform)/dashboard/operator/invoices", label: "Fatture", icon: FileText },
  { href: "/(platform)/dashboard/operator/tax-info", label: "Dati Fiscali", icon: Shield },
  { href: "/(platform)/dashboard/operator/internal-messages", label: "Messaggi Interni", icon: MessageSquare },
  { href: "/(platform)/dashboard/operator/reviews", label: "Recensioni", icon: BookOpen },
  { href: "/(platform)/dashboard/operator/support", label: "Supporto", icon: LifeBuoy },
]

export default function OperatorNavClient() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-2">
      <div className="p-2 mb-4">
        <OperatorStatusToggle />
      </div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100",
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
