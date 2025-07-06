"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, CreditCard, LogOut, MessageSquare, Star, User, Wallet, FileText, Phone, Menu } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/dashboard/client", label: "Dashboard", icon: User },
  { href: "/dashboard/client/consultations", label: "Consulti", icon: MessageSquare },
  { href: "/dashboard/client/written-consultations", label: "Consulti Scritti", icon: FileText },
  { href: "/dashboard/client/calls", label: "Chiamate", icon: Phone },
  { href: "/dashboard/client/wallet", label: "Portafoglio", icon: Wallet },
  { href: "/dashboard/client/reviews", label: "Recensioni", icon: Star },
  { href: "/dashboard/client/support", label: "Supporto", icon: CreditCard },
]

function SidebarNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === item.href && "bg-muted text-primary",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button onClick={logout} variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-lg">Dashboard Cliente</span>
            </Link>
          </div>
          <SidebarNav />
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <span className="text-lg">Dashboard Cliente</span>
                </Link>
              </div>
              <SidebarNav />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">{profile?.username || "Bentornato"}</h1>
          </div>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8 bg-transparent">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
