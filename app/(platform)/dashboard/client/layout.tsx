"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, MenuIcon, Home, Wallet, MessageSquare, Star, LifeBuoy, Briefcase, Mail, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuthProvider } from "@/contexts/auth-context"
import ClientDashboardClientPage from "./ClientDashboardClientPage"

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

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  return "/"
}

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const pathname = usePathname()
  const { logout } = useAuth()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Devi essere loggato per accedere a questa pagina.")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "client") {
    const targetUrl = getDashboardUrl(profile?.role)
    return redirect(targetUrl + "?error=Accesso non autorizzato.")
  }

  const SidebarNavClient = () => (
    <nav className="grid items-start gap-1.5 px-3">
      {navItemsClient.map((item) => (
        <NavItemClient key={item.label} item={item} pathname={pathname} />
      ))}
    </nav>
  )

  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <ClientDashboardClientPage />
        <div className="flex flex-col">
          <header className="flex h-20 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 sm:p-6 md:p-8 sticky top-16 z-30">
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
                <AvatarImage
                  src={profile?.avatar_url || "/placeholder.svg?height=38&width=38"}
                  alt={profile?.full_name || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium">
                  {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}
