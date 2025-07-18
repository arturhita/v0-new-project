"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Percent,
  TrendingUp,
  Bell,
  Settings,
  LifeBuoy,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/operators", label: "Operatori", icon: UserCheck },
  { href: "/admin/invoices", label: "Fatture", icon: FileText },
  { href: "/admin/payouts", label: "Pagamenti", icon: CreditCard },
  { href: "/admin/promotions", label: "Promozioni", icon: Percent },
  { href: "/admin/commission-requests", label: "Richieste Commissione", icon: TrendingUp },
  { href: "/admin/notifications", label: "Notifiche", icon: Bell },
  { href: "/admin/tickets", label: "Ticket Supporto", icon: LifeBuoy },
  { href: "/admin/settings/general", label: "Impostazioni", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-white">
      <div className="flex h-full flex-col">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                pathname.startsWith(item.href) ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
