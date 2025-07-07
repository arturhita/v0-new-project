"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  MessageSquare,
  Users,
  Settings,
  LifeBuoy,
  LayoutDashboard,
  FileText,
  Calendar,
  Wallet,
  Briefcase,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import OperatorStatusToggle from "@/components/operator-status-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { href: "/(platform)/dashboard/operator", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/(platform)/dashboard/operator/consultations-history", icon: FileText, label: "Consulti" },
  { href: "/(platform)/dashboard/operator/platform-messages", icon: MessageSquare, label: "Messaggi" },
  { href: "/(platform)/dashboard/operator/availability", icon: Calendar, label: "Disponibilità" },
  { href: "/(platform)/dashboard/operator/earnings", icon: Wallet, label: "Guadagni" },
  { href: "/(platform)/dashboard/operator/services", icon: Briefcase, label: "Servizi" },
  { href: "/(platform)/dashboard/operator/reviews", icon: Star, label: "Recensioni" },
  { href: "/(platform)/dashboard/operator/client-notes", icon: Users, label: "Note Clienti" },
  { href: "/(platform)/dashboard/operator/settings", icon: Settings, label: "Impostazioni" },
  { href: "/(platform)/dashboard/operator/support", icon: LifeBuoy, label: "Supporto" },
]

export default function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <OperatorStatusProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-50">
        <div className="hidden border-r bg-white md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Briefcase className="h-6 w-6 text-sky-600" />
                <span className="text-slate-800">Area Operatore</span>
              </Link>
              <button className="ml-auto h-8 w-8 rounded-full border border-slate-200">
                <Bell className="h-4 w-4 mx-auto text-slate-500" />
                <span className="sr-only">Toggle notifications</span>
              </button>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href
                  return (
                    <Link
                      key={label}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100",
                        isActive && "bg-slate-100 text-slate-900",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 space-y-4">
              <OperatorStatusToggle />
              <div className="flex items-center gap-3 border-t pt-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>OP</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-800">Nome Operatore</p>
                  <p className="text-xs text-slate-500">operator@email.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 md:p-8 bg-slate-50 overflow-y-auto">{children}</main>
        </div>
      </div>
    </OperatorStatusProvider>
  )
}
