"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  MenuIcon,
  LogOut,
  LayoutDashboard,
  Calendar,
  FileClock,
  MessageSquare,
  Wallet,
  CreditCard,
  FileEdit,
  Percent,
  User,
  Sparkles,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import OperatorStatusToggle from "@/components/operator-status-toggle"

const navItemsOperator = [
  { href: "/dashboard/operator", label: "Panoramica", icon: LayoutDashboard },
  { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/dashboard/operator/consultations-history", label: "Storico Consulti", icon: FileClock },
  { href: "/dashboard/operator/written-consultations", label: "Consulti Scritti", icon: FileEdit },
  { href: "/dashboard/operator/platform-messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: Wallet },
  { href: "/dashboard/operator/payouts", label: "Pagamenti", icon: CreditCard },
  { href: "/dashboard/operator/commission-request", label: "Commissioni", icon: Percent },
  { href: "/profile/operator", label: "Profilo Pubblico", icon: User },
  { href: "/dashboard/operator/settings", label: "Impostazioni", icon: Settings },
]

const NavItem = ({ item, pathname }: { item: (typeof navItemsOperator)[0]; pathname: string }) => {
  const isActive = pathname === item.href || (item.href !== "/dashboard/operator" && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
        "hover:bg-purple-100 hover:text-purple-700",
        isActive ? "bg-purple-600 text-white shadow-md font-semibold" : "text-gray-700",
      )}
    >
      <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-gray-400")} />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export default function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const SidebarNav = () => (
    <nav className="grid items-start gap-1.5 px-3">
      {navItemsOperator.map((item) => (
        <NavItem key={item.label} item={item} pathname={pathname} />
      ))}
    </nav>
  )

  return (
    <OperatorStatusProvider operatorName={user?.name || "Operatore"}>
      <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-gray-200 bg-white md:block">
          <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6 bg-gradient-to-br from-purple-600 to-indigo-700">
              <Link href="/dashboard/operator" className="flex items-center gap-2.5 font-bold text-white text-lg">
                <Sparkles className="h-6 w-6" />
                <span>Area Operatore</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-5 space-y-2">
              <SidebarNav />
            </div>
            <div className="mt-auto p-3 border-t border-gray-200">
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start text-base font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-100"
              >
                <LogOut className="mr-2.5 h-5 w-5" />
                Esci
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="flex h-20 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden rounded-lg border-2 border-purple-300 text-purple-600 hover:bg-purple-100 bg-transparent"
                >
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Apri menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-white p-0 w-[280px] border-gray-200">
                <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6 bg-gradient-to-br from-purple-600 to-indigo-700">
                  <Link href="/dashboard/operator" className="flex items-center gap-2.5 font-bold text-white text-lg">
                    <Sparkles className="h-6 w-6" />
                    <span>Area Operatore</span>
                  </Link>
                </div>
                <div className="py-5 flex-1 overflow-auto">
                  <SidebarNav />
                </div>
                <div className="mt-auto p-3 border-t border-gray-200">
                  <Button
                    onClick={logout}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-100"
                  >
                    <LogOut className="mr-2.5 h-5 w-5" />
                    Esci
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1">
              <OperatorStatusToggle />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-100"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifiche</span>
              </Button>
              <Avatar className="h-10 w-10 border-2 border-purple-200">
                <AvatarImage
                  src={user?.avatarUrl || "/placeholder.svg?height=38&width=38"}
                  alt={user?.name || "Operator"}
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-gray-50">{children}</main>
        </div>
      </div>
    </OperatorStatusProvider>
  )
}
