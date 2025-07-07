"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Menu, Sparkles } from "lucide-react"

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  const navItems = [
    { href: "/dashboard/client", label: "Dashboard" },
    { href: "/dashboard/client/consultations", label: "Consulti" },
    { href: "/dashboard/client/messages", label: "Messaggi" },
    { href: "/dashboard/client/wallet", label: "Wallet" },
    { href: "/dashboard/client/reviews", label: "Recensioni" },
    { href: "/dashboard/client/support", label: "Supporto" },
  ]

  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="">Moonthir</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Button size="sm" className="w-full" onClick={logout}>
                Logout
              </Button>
            </div>
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
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="">Moonthir</span>
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto">
                  <Button size="sm" className="w-full" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">{/* Optional: Add a search bar or other header elements here */}</div>
            <span className="text-sm text-muted-foreground">Benvenuto, {user?.name}</span>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
