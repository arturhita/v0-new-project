"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  MenuIcon,
  Home,
  Wallet,
  MessageSquare,
  Star,
  LifeBuoy,
  Briefcase,
  LogOut,
  Mail,
  UserCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { Suspense } from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { useAuth } from "@/contexts/auth-context"

const navItemsClient = [
  { href: "/dashboard/client", label: "Panoramica", icon: Home },
  { href: "/dashboard/client/wallet", label: "Il Mio Wallet", icon: Wallet },
  { href: "/dashboard/client/consultations", label: "Storico Consulenze", icon: Briefcase },
  { href: "/dashboard/client/written-consultations", label: "Consulti Scritti", icon: Mail },
  { href: "/dashboard/client/messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/client/reviews", label: "Le Mie Recensioni", icon: Star },
  { href: "/dashboard/client/support", label: "Supporto", icon: LifeBuoy },
  { href: "/profile", label: "Il Mio Profilo", icon: UserCircle },
]

const NavItemClient = ({ item, pathname }: { item: (typeof navItemsClient)[0]; pathname: string }) => {
  const isActive = pathname === item.href || (item.href !== "/dashboard/client" && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
        "hover:bg-blue-100 hover:text-blue-700",
        isActive && "bg-blue-600 text-white shadow-md font-semibold",
        !isActive && "text-gray-700",
      )}
    >
      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
      {item.label}
    </Link>
  )
}

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const SidebarNavClient = () => (
    <nav className="grid items-start gap-1.5 px-3">
      {navItemsClient.map((item) => (
        <NavItemClient key={item.label} item={item} pathname={pathname} />
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Site Navbar */}
      <SiteNavbar />

      <div className="grid w-full md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr] pt-16">
        {/* Sidebar Cliente */}
        <aside className="hidden border-r border-gray-200 bg-white md:block shadow-lg rounded-r-xl m-0 md:m-2 md:my-2 md:mr-0 overflow-hidden">
          <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6 bg-gradient-to-br from-blue-600 to-blue-700">
              <Link href="/dashboard/client" className="flex items-center gap-2.5 font-bold text-white text-lg">
                <span>Dashboard</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-5 space-y-2">
              <SidebarNavClient />
            </div>
            <div className="mt-auto p-3 border-t border-gray-200">
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-100"
              >
                <LogOut className="mr-2.5 h-5 w-5" />
                Esci
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area Cliente */}
        <div className="flex flex-col">
          <header className="flex h-20 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 md:px-6 sticky top-16 z-30">
            <Suspense fallback={<div>Loading...</div>}>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden rounded-lg border-2 border-blue-300 text-blue-600 hover:bg-blue-100 bg-transparent"
                  >
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Apri menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col bg-white p-0 w-[280px] border-gray-200">
                  <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6 bg-gradient-to-br from-blue-600 to-blue-700">
                    <Link href="/dashboard/client" className="flex items-center gap-2.5 font-bold text-white text-lg">
                      <span>Dashboard</span>
                    </Link>
                  </div>
                  <div className="py-5 flex-1 overflow-auto">
                    <SidebarNavClient />
                  </div>
                </SheetContent>
              </Sheet>
            </Suspense>

            <div className="flex-1"></div>

            <div className="flex items-center gap-3 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifiche</span>
              </Button>
              <Avatar className="h-10 w-10 border-2 border-blue-200">
                <AvatarImage src="/placeholder.svg?height=38&width=38" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium">
                  U
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
