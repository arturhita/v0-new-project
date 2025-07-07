"use client"

import Link from "next/link"
import { usePathname, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  MenuIcon,
  LayoutDashboard,
  User,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Loader2,
  MessageCircle,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { useAuth } from "@/contexts/auth-context"

const navItemsOperator = [
  { href: "/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/operator/profile", label: "Profilo Pubblico", icon: User },
  { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: DollarSign },
  { href: "/dashboard/operator/messages", label: "Messaggi", icon: MessageCircle },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: Star },
  { href: "/dashboard/operator/settings", label: "Impostazioni", icon: Settings },
]

const NavItemOperator = ({ item, pathname }: { item: (typeof navItemsOperator)[0]; pathname: string }) => {
  const isActive = pathname === item.href
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
        "hover:bg-gray-100 hover:text-gray-900",
        isActive ? "bg-gray-900 text-white font-semibold" : "text-gray-700",
      )}
    >
      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
      {item.label}
    </Link>
  )
}

export default function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { profile, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    redirect("/login")
    return null
  }

  if (profile.role !== "operator") {
    redirect("/") // Or an unauthorized page
    return null
  }

  const SidebarNavOperator = () => (
    <nav className="grid items-start gap-1.5 px-3">
      {navItemsOperator.map((item) => (
        <NavItemOperator key={item.label} item={item} pathname={pathname} />
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid w-full md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-gray-200 bg-white md:block">
          <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
                <span>Moonthir Operatore</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-5 space-y-2">
              <SidebarNavOperator />
            </div>
            <div className="mt-auto p-3 border-t border-gray-200">
              <Button onClick={logout} variant="ghost" className="w-full justify-start text-base font-medium">
                <LogOut className="mr-2.5 h-5 w-5" />
                Esci
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="flex h-20 items-center gap-4 border-b border-gray-200 bg-white/95 px-4 md:px-6 sticky top-0 z-30">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Apri menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-white p-0 w-[280px]">
                <div className="flex h-20 items-center justify-center border-b">
                  <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
                    <span>Moonthir Operatore</span>
                  </Link>
                </div>
                <div className="py-5 flex-1 overflow-auto">
                  <SidebarNavOperator />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1" />

            <div className="flex items-center gap-3 ml-auto">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifiche</span>
              </Button>
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
