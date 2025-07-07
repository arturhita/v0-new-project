"use client"

import { Button } from "@/components/ui/button"
import type React from "react"
import {
  BarChart3,
  LayoutDashboard,
  ListChecks,
  Percent,
  Settings,
  Users,
  Briefcase,
  Calendar,
  FileClock,
  MessageSquare,
  Star,
  Wallet,
  LogOut,
  Bell,
  User,
  CreditCard,
  FileEdit,
  Headset,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/operators", label: "Operatori", icon: Briefcase },
  { href: "/admin/operator-approvals", label: "Approvazioni", icon: ListChecks },
  { href: "/admin/payouts", label: "Pagamenti", icon: CreditCard },
  { href: "/admin/reviews", label: "Recensioni", icon: Star },
  { href: "/admin/commission-requests-log", label: "Commissioni", icon: Percent },
  { href: "/admin/tickets", label: "Supporto", icon: Headset },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Impostazioni", icon: Settings },
]

export const operatorNavItems: NavItem[] = [
  { href: "/(platform)/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/(platform)/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/(platform)/dashboard/operator/consultations-history", label: "Consulti", icon: FileClock },
  { href: "/(platform)/dashboard/operator/platform-messages", label: "Messaggi", icon: MessageSquare },
  { href: "/(platform)/dashboard/operator/earnings", label: "Guadagni", icon: Wallet },
  { href: "/(platform)/dashboard/operator/payouts", label: "Pagamenti", icon: CreditCard },
  { href: "/(platform)/dashboard/operator/client-notes", label: "Note Clienti", icon: FileEdit },
  { href: "/(platform)/dashboard/operator/commission-request", label: "Commissioni", icon: Percent },
  { href: "/(platform)/profile/operator", label: "Profilo Pubblico", icon: User },
]

function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100",
            pathname === item.href && "bg-gray-100 text-gray-900",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userType: "admin" | "user" | "operator"
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const navItems = userType === "admin" ? adminNavItems : operatorNavItems

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-white lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/images/moonthir-logo.png" alt="Moonthir Logo" width={32} height={32} />
              <span className="">Moonthir</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <SidebarNav items={navItems} />
          </div>
          <div className="mt-auto p-4 border-t">
            <Link
              href="/logout"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-white px-6">
          <div className="flex-1">{/* Mobile nav trigger can go here */}</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            {/* User dropdown can be added here */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">{children}</main>
      </div>
    </div>
  )
}
