"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  MenuIcon,
  LayoutDashboard,
  Users,
  Wallet,
  BookOpen,
  BarChart2,
  MessageSquareWarning,
  Send,
  LifeBuoy,
  Sparkles,
  CheckCircle,
  ChevronDown,
  Search,
  Moon,
  Scroll,
  Coins,
  Building,
  Settings,
  LogOut,
  PlusCircle,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import React, { Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  { href: "/admin", label: "Cruscotto", icon: LayoutDashboard },
  {
    label: "Operatori",
    icon: Sparkles,
    subItems: [
      { href: "/admin/operator-approvals", label: "Approvazioni", icon: CheckCircle },
      { href: "/admin/operators", label: "Elenco Operatori", icon: Users },
      { href: "/admin/operators/create", label: "Crea Operatore", icon: PlusCircle },
    ],
  },
  { href: "/admin/users", label: "Utenti", icon: Moon },
  { href: "/admin/promotions", label: "Promozioni", icon: Target },
  {
    label: "Finanze",
    icon: Coins,
    subItems: [
      { href: "/admin/payouts", label: "Pagamenti", icon: Wallet },
      { href: "/admin/invoices", label: "Fatture", icon: Scroll },
    ],
  },
  { href: "/admin/analytics", label: "Statistiche", icon: BarChart2 },
  { href: "/admin/reviews", label: "Recensioni", icon: MessageSquareWarning },
  { href: "/admin/blog-management", label: "Gestione Blog", icon: BookOpen },
  {
    label: "Supporto",
    icon: Send,
    subItems: [
      { href: "/admin/notifications", label: "Notifiche", icon: Send },
      { href: "/admin/tickets", label: "Ticket", icon: LifeBuoy },
    ],
  },
  {
    label: "Configurazione",
    icon: Settings,
    subItems: [
      { href: "/admin/company-details", label: "Dati Aziendali", icon: Building },
      { href: "/admin/settings", label: "Impostazioni", icon: Settings },
      { href: "/admin/settings/advanced", label: "Impostazioni Avanzate", icon: Settings },
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

export default function ModernAdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const SidebarNav = () => (
    <nav className="grid items-start gap-1.5 px-3">
      {navItems.map((item) =>
        "subItems" in item ? (
          <CollapsibleNavItem key={item.label} item={item} pathname={pathname} />
        ) : (
          <NavItem key={item.label} item={item} pathname={pathname} />
        ),
      )}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid w-full md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        <aside className="hidden border-r border-gray-200 bg-white md:block">
          <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6 bg-gradient-to-br from-blue-600 to-blue-700">
              <Link href="/admin" className="flex items-center gap-3 font-bold text-white text-xl">
                <span>Admin Panel</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-6 space-y-4">
              <SidebarNav />
            </div>
            <div className="mt-auto p-4 border-t border-gray-200">
              <Button
                onClick={logout}
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
          <header className="flex h-20 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 md:px-8 sticky top-0 z-30">
            <Suspense fallback={<div>Loading...</div>}>
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
                  <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6 bg-gradient-to-br from-blue-600 to-blue-700">
                    <Link href="/admin" className="flex items-center gap-3 font-bold text-white text-xl">
                      <span>Admin Panel</span>
                    </Link>
                  </div>
                  <div className="py-6 flex-1 overflow-auto">
                    <SidebarNav />
                  </div>
                </SheetContent>
              </Sheet>
            </Suspense>
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
  )
}
