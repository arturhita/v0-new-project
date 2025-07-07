"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, BarChart, FileText, Settings, Percent, BookUser, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { OperatorStatusToggle } from "@/components/operator-status-toggle"

const navItems = [
  { href: "/(platform)/dashboard/operator/profile", label: "Profilo Pubblico", icon: User },
  { href: "/(platform)/dashboard/operator/stories", label: "Storie", icon: Camera },
  { href: "/(platform)/dashboard/operator/earnings", label: "Guadagni", icon: BarChart },
  { href: "/(platform)/dashboard/operator/invoices", label: "Fatture", icon: FileText },
  { href: "/(platform)/dashboard/operator/payout-settings", label: "Impostazioni Pagamento", icon: Settings },
  { href: "/(platform)/dashboard/operator/commission-request", label: "Richiesta Commissione", icon: Percent },
  { href: "/(platform)/dashboard/operator/tax-info", label: "Dati Fiscali", icon: BookUser },
]

export function NavClient({ operatorId }: { operatorId: string }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col p-4">
      <div className="mb-4">
        <OperatorStatusToggle operatorId={operatorId} />
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900",
                pathname === item.href && "bg-indigo-50 text-indigo-600",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
