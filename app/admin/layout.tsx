"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  MenuIcon,
  Users,
  BarChart2,
  LifeBuoy,
  ChevronDown,
  Search,
  Settings,
  LogOut,
  Home,
  FileText,
  CreditCard,
  MessageSquare,
  Banknote,
  Mail,
  Trophy,
  Gift,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Utenti" },
  { href: "/admin/operators", icon: Users, label: "Operatori" },
  { href: "/admin/operator-approvals", icon: FileText, label: "Approvazioni Operatori" },
  { href: "/admin/reviews", icon: FileText, label: "Recensioni" },
  { href: "/admin/invoices", icon: CreditCard, label: "Fatture" },
  { href: "/admin/payouts", icon: Banknote, label: "Pagamenti" },
  { href: "/admin/promotions", icon: Gift, label: "Promozioni" },
  { href: "/admin/commission-requests-log", icon: MessageSquare, label: "Log Commissioni" },
  { href: "/admin/blog-management", icon: FileText, label: "Gestione Blog" },
  { href: "/admin/tickets", icon: LifeBuoy, label: "Ticket Supporto" },
  { href: "/admin/notifications", icon: Bell, label: "Notifiche di Sistema" },
  { href: "/admin/email-center", icon: Mail, label: "Email Center" },
  { href: "/admin/gamification", icon: Trophy, label: "Gamification" },
  { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Impostazioni",
    subItems: [
      { href: "/admin/settings/general", label: "Generali" },
      { href: "/admin/settings/legal", label: "Legale" },
      { href: "/admin/settings/advanced", label: "Avanzate" },
    ],
  },
]

const NavItem = ({
  item,
  pathname,
}: {
  item: (typeof navItems)[0] | (typeof navItems)[0]["subItems"][0]
  pathname: string
}) => {
  const isActive = item.href
    ? pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
    : false

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium text-gray-600 transition-colors duration-200 ease-in-out group",
        "hover:bg-blue-100 hover:text-blue-700",
        isActive && "bg-blue-600 text-white shadow-md scale-[1.02] font-semibold",
      )}
    >
      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
      {item.label}
    </Link>
  )
}

const CollapsibleNavItem = ({
  item,
  pathname,
}: {
  item: Extract<(typeof navItems)[number], { subItems: any }>
  pathname: string
}) => {
  const [isOpen, setIsOpen] = React.useState(item.subItems.some((sub) => pathname.startsWith(sub.href)))

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-3.5 rounded-lg px-4 py-3 text-base font-medium text-gray-600 transition-colors duration-200 ease-in-out",
          "hover:bg-blue-100 hover:text-blue-700",
        )}
      >
        <div className="flex items-center gap-3.5">
          <item.icon className="h-5 w-5 text-gray-400" />
          {item.label}
        </div>
        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-200 pl-3.5">
          {item.subItems.map((subItem) => (
            <NavItem key={subItem.label} item={subItem} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    // If not an admin, redirect them away.
    // You can decide where to send them, e.g., their own dashboard or login.
    redirect("/login")
  }

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const auth = useAuth()

  return (
    <DashboardLayout navItems={navItems}>
      <div className="min-h-screen bg-gray-100">
        {/* Site Navbar */}
        <SiteNavbar />

        <div className="grid w-full md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] pt-16">
          <aside className="hidden border-r border-gray-200 bg-white md:block shadow-lg rounded-r-2xl m-0 md:m-3 md:my-3 md:mr-0 overflow-hidden">
            <div className="flex h-full max-h-screen flex-col">
              <div className="flex h-24 items-center justify-center border-b border-gray-200 px-6 bg-gradient-to-br from-blue-600 to-blue-700">
                <Link href="/admin" className="flex items-center gap-3 font-bold text-white text-xl">
                  <span>Admin Panel</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-6 space-y-4">
                <nav className="grid items-start gap-1.5 px-3">
                  {navItems.map((item) =>
                    "subItems" in item ? (
                      <CollapsibleNavItem key={item.label} item={item} pathname={pathname} />
                    ) : (
                      <NavItem key={item.label} item={item} pathname={pathname} />
                    ),
                  )}
                </nav>
              </div>
              <div className="mt-auto p-4 border-t border-gray-200">
                <Button
                  onClick={() => auth.logout()}
                  variant="ghost"
                  className="w-full justify-start text-base font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Disconnetti
                </Button>
              </div>
            </div>
          </aside>
          <div className="flex flex-col">
            <header className="flex h-24 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 md:px-8 sticky top-16 z-30">
              <React.Suspense fallback={<div>Loading...</div>}>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 md:hidden rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-100 bg-transparent"
                    >
                      <MenuIcon className="h-7 w-7" />
                      <span className="sr-only">Apri menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col bg-white p-0 w-[300px]">
                    <div className="flex h-24 items-center justify-center border-b border-gray-200 px-6 bg-gradient-to-br from-blue-600 to-blue-700">
                      <Link href="/admin" className="flex items-center gap-3 font-bold text-white text-xl">
                        <span>Admin Panel</span>
                      </Link>
                    </div>
                    <div className="py-6 flex-1 overflow-auto">
                      <nav className="grid items-start gap-1.5 px-3">
                        {navItems.map((item) =>
                          "subItems" in item ? (
                            <CollapsibleNavItem key={item.label} item={item} pathname={pathname} />
                          ) : (
                            <NavItem key={item.label} item={item} pathname={pathname} />
                          ),
                        )}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </React.Suspense>
              <div className="relative w-full max-w-md flex-1 ml-auto md:ml-0">
                <Input
                  type="search"
                  placeholder="Cerca..."
                  className="w-full rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 pl-10 py-3 text-base shadow-inner"
                />
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100"
                >
                  <Bell className="h-6 w-6" />
                  <span className="sr-only">Notifiche</span>
                </Button>
                <Avatar className="h-11 w-11 border-2 border-blue-200 shadow-sm">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                    A
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10">{children}</main>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
