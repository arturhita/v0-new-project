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
  MessageSquare,
  Star,
  LifeBuoy,
  Settings,
  LogOut,
  Wallet,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

const navItemsClient = [
  { href: "/dashboard/client", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/client/wallet", label: "Portafoglio", icon: Wallet }, // Nuovo link
  { href: "/dashboard/client/consultations", label: "Miei Consulti", icon: Briefcase },
  { href: "/dashboard/client/messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/client/reviews", label: "Recensioni", icon: Star },
  { href: "/dashboard/client/support", label: "Supporto", icon: LifeBuoy },
  { href: "/profile", label: "Profilo", icon: Settings },
]

const NavItemClient = ({ item, pathname }: { item: (typeof navItemsClient)[0]; pathname: string }) => {
  const isActive = pathname === item.href
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700",
        isActive && "bg-gray-800 text-white",
      )}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  )
}

function ClientDashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const SidebarNavClient = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItemsClient.map((item) => (
        <NavItemClient key={item.label} item={item} pathname={pathname} />
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white">
      <SiteNavbar />
      <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] pt-16">
        <aside className="hidden border-r bg-gray-900/50 border-gray-800 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b border-gray-800 px-4 lg:h-[60px] lg:px-6">
              <Link href="/dashboard/client" className="flex items-center gap-2 font-semibold">
                <LayoutDashboard className="h-6 w-6 text-purple-400" />
                <span className="">Area Cliente</span>
              </Link>
            </div>
            <div className="flex-1">
              <SidebarNavClient />
            </div>
            <div className="mt-auto p-4 border-t border-gray-800">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Disconnetti
              </Button>
            </div>
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-gray-900/50 border-gray-800 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent border-gray-700">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Apri menu navigazione</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-gray-900 border-gray-800 text-white">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <LayoutDashboard className="h-6 w-6 text-purple-400" />
                    <span>Area Cliente</span>
                  </Link>
                  {navItemsClient.map((item) => (
                    <NavItemClient key={item.label} item={item} pathname={pathname} />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1" />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifiche</span>
            </Button>
            <Avatar>
              <AvatarImage src={user?.user_metadata.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientDashboardLayoutContent>{children}</ClientDashboardLayoutContent>
    </ProtectedRoute>
  )
}
