"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  Settings,
  Users,
  FileText,
  MessageSquare,
  Star,
  Percent,
  Mail,
  Gamepad2,
  Banknote,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Utenti" },
  { href: "/admin/operators", icon: Users, label: "Operatori" },
  { href: "/admin/operator-approvals", icon: Package, label: "Approvazioni" },
  { href: "/admin/payouts", icon: Banknote, label: "Pagamenti" },
  { href: "/admin/invoices", icon: FileText, label: "Fatture" },
  { href: "/admin/reviews", icon: Star, label: "Recensioni" },
  { href: "/admin/tickets", icon: MessageSquare, label: "Ticket Supporto" },
  { href: "/admin/promotions", icon: Percent, label: "Promozioni" },
  { href: "/admin/notifications", icon: Bell, label: "Notifiche" },
  { href: "/admin/email-center", icon: Mail, label: "Email Center" },
  { href: "/admin/analytics", icon: LineChart, label: "Analytics" },
  { href: "/admin/gamification", icon: Gamepad2, label: "Gamification" },
  { href: "/admin/settings", icon: Settings, label: "Impostazioni" },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
