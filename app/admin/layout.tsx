"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Star,
  FileText,
  UserCheck,
  PenLine,
  DollarSign,
  Zap,
  Shield,
  Menu,
  MessageSquare,
  Trophy,
  LogOut,
  UserCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/operators", label: "Operatori", icon: Briefcase },
  { href: "/admin/operator-approvals", label: "Approvazioni", icon: UserCheck, badge: 3 },
  { href: "/admin/reviews", label: "Recensioni", icon: Star },
  { href: "/admin/tickets", label: "Ticket Supporto", icon: MessageSquare },
  { href: "/admin/blog-management", label: "Blog", icon: PenLine },
  { href: "/admin/promotions", label: "Promozioni", icon: Zap },
  { href: "/admin/payouts", label: "Pagamenti", icon: DollarSign },
  { href: "/admin/gamification", label: "Gamification", icon: Trophy },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

const settingsItems = [
  { href: "/admin/settings", label: "Generali", icon: Settings },
  { href: "/admin/settings/advanced", label: "Avanzate", icon: Shield },
  { href: "/admin/settings/legal", label: "Testi Legali", icon: FileText },
]

function AdminSidebarNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <h3 className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Generale</h3>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-indigo-500/10",
                pathname === item.href && "bg-indigo-500/20 text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/80">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
          <h3 className="px-2 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Impostazioni</h3>
          {settingsItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-indigo-500/10",
                pathname === item.href && "bg-indigo-500/20 text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-indigo-500/20">
        <nav className="grid items-start text-sm font-medium">
          <Link
            href="/admin/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-indigo-500/10",
              pathname === "/admin/profile" && "bg-indigo-500/20 text-white",
            )}
          >
            <UserCircle className="h-4 w-4" />
            Il Mio Profilo
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-all hover:text-red-300 hover:bg-red-500/10 text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNavbar />
      <div className="flex-grow pt-16">
        <div className="grid min-h-full w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-900 text-white">
          <div className="hidden border-r border-indigo-500/20 bg-slate-900/50 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2 sticky top-16">
              <div className="flex h-14 items-center border-b border-indigo-500/20 px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                  <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={24} height={24} />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                    Moonthir Admin
                  </span>
                </Link>
              </div>
              <AdminSidebarNav />
            </div>
          </div>
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b border-indigo-500/20 bg-slate-900/50 px-4 lg:h-[60px] lg:px-6 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 bg-transparent border-slate-700">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col bg-slate-900 border-r-slate-800 text-white p-0">
                  <div className="flex h-14 items-center border-b border-indigo-500/20 px-4 lg:h-[60px] lg:px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                      <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={24} height={24} />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                        Moonthir Admin
                      </span>
                    </Link>
                  </div>
                  <AdminSidebarNav />
                </SheetContent>
              </Sheet>
              <div className="w-full flex-1">{/* Search bar can go here */}</div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
