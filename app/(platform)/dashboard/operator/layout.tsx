"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  BookText,
  Briefcase,
  Calendar,
  CircleUser,
  Coins,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Star,
  Wallet,
  Package2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import OperatorStatusToggle from "@/components/operator-status-toggle"

const menuItems = [
  { href: "/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/dashboard/operator/consultations-history", label: "Storico Consulti", icon: BookText },
  { href: "/dashboard/operator/written-consultations", label: "Consulti Scritti", icon: FileText },
  { href: "/dashboard/operator/platform-messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: Star },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: Coins },
  { href: "/dashboard/operator/payouts", label: "Pagamenti", icon: Wallet },
  { href: "/dashboard/operator/profile", label: "Profilo Pubblico", icon: CircleUser },
  { href: "/dashboard/operator/services", label: "Servizi", icon: Briefcase },
  { href: "/dashboard/operator/settings", label: "Impostazioni", icon: Settings },
]

function NavLink({ item }: { item: (typeof menuItems)[0] }) {
  const pathname = usePathname()
  // La logica di `isActive` deve confrontare il path attuale con l'href del menu item
  const isActive = pathname === item.href

  return (
    <Link
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
}

export default function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Moonthir</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8 bg-transparent">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {menuItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">{user && <OperatorStatusToggle operatorId={user.id} />}</div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}
