"use client"

import { useAuth } from "@/contexts/auth-context"
import { CircleUser, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { operatorNavItems } from "./nav-items"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import OperatorDashboardLayoutClient from "./OperatorDashboardLayoutClient"

export default async function OperatorDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Redirect if not an operator
  if (profile?.role !== "operator") {
    if (profile?.role === "admin") {
      redirect("/admin/dashboard")
    } else {
      redirect("/dashboard/client")
    }
  }

  const { profile: clientProfile, logout } = useAuth()
  const pathname = usePathname()

  return (
    <OperatorDashboardLayoutClient>
      <DashboardLayout navItems={operatorNavItems}>
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
                  <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Image src="/images/moonthir-logo.png" alt="Moonthir Logo" width={32} height={32} />
                    <span className="sr-only">Moonthir</span>
                  </Link>
                  {operatorNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                        pathname === item.href && "bg-muted text-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {clientProfile?.stage_name || clientProfile?.full_name || "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile/operator">Impostazioni Profilo</Link>
                </DropdownMenuItem>
                {clientProfile?.stage_name && (
                  <DropdownMenuItem asChild>
                    <Link href={`/operator/${clientProfile.stage_name}`}>Vedi Profilo Pubblico</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">{children}</main>
        </div>
      </DashboardLayout>
    </OperatorDashboardLayoutClient>
  )
}
