"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  MenuIcon,
  LayoutDashboard,
  CalendarClock,
  Sparkles,
  Coins,
  FileText,
  Briefcase,
  MessageSquareHeart,
  BookUser,
  Settings,
  LogOut,
  Percent,
  MailQuestion,
  Scroll,
  ShieldCheck,
  MessageSquare,
  Moon,
  Sun,
  Coffee,
  ChevronDown,
  UserIcon,
  View,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { Suspense } from "react"
import { OperatorStatusProvider, useOperatorStatus } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import { IncomingChatRequestModal } from "@/components/incoming-chat-request-modal"
import { SiteNavbar } from "@/components/site-navbar"
import { useAuth } from "@/contexts/auth-context"

const navItemsOperator = [
  { href: "/dashboard/operator", label: "Santuario Personale", icon: LayoutDashboard },
  { href: "/dashboard/operator/availability", label: "Orari Arcani", icon: CalendarClock },
  { href: "/dashboard/operator/services", label: "Modalità Consulto", icon: Sparkles },
  { href: "/dashboard/operator/earnings", label: "Tesoro Astrale", icon: Coins },
  { href: "/dashboard/operator/payouts", label: "Richieste Compensi", icon: FileText },
  { href: "/dashboard/operator/invoices", label: "Fatture Cosmiche", icon: Scroll },
  { href: "/dashboard/operator/tax-info", label: "Dati Fiscali Segreti", icon: ShieldCheck },
  { href: "/dashboard/operator/consultations-history", label: "Archivio Consulti", icon: Briefcase },
  { href: "/dashboard/operator/written-consultations", label: "Consulti Epistolari", icon: MailQuestion },
  { href: "/dashboard/operator/internal-messages", label: "Messaggi dal Tempio", icon: MessageSquareHeart },
  { href: "/dashboard/operator/platform-messages", label: "Messaggi dalla Piattaforma", icon: MessageSquare },
  { href: "/dashboard/operator/client-notes", label: "Appunti sui Cercatori", icon: BookUser },
  { href: "/dashboard/operator/commission-request", label: "Richiesta Decima", icon: Percent },
  { href: "/profile/operator", label: "Il Mio Altare (Profilo)", icon: Settings },
]

const NavItemOperator = ({ item, pathname }: { item: (typeof navItemsOperator)[0]; pathname: string }) => {
  const isActive = pathname === item.href || (item.href !== "/dashboard/operator" && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
        "hover:bg-blue-700 hover:text-white",
        isActive && "bg-blue-600 text-white shadow-md font-semibold",
        !isActive && "text-blue-200",
      )}
    >
      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-blue-300")} />
      {item.label}
    </Link>
  )
}

function OperatorDashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { status, setStatus, operatorName, pauseTimer } = useOperatorStatus()
  const { logout, profile } = useAuth()

  const handleSetStatusManually = (newStatus: "online" | "offline" | "paused") => {
    setStatus(newStatus, true)
  }

  const getStatusIndicator = () => {
    switch (status) {
      case "online":
        return { text: "Online", dotClass: "bg-green-500" }
      case "offline":
        return { text: "Offline", dotClass: "bg-gray-500" }
      case "occupied":
        return { text: "Occupato", dotClass: "bg-red-500 animate-pulse" }
      case "paused":
        return {
          text: `In Pausa (${Math.floor(pauseTimer / 60)}:${(pauseTimer % 60).toString().padStart(2, "0")})`,
          dotClass: "bg-amber-500",
        }
      default:
        return { text: "Offline", dotClass: "bg-gray-500" }
    }
  }
  const currentStatusInfo = getStatusIndicator()

  const SidebarNavOperator = () => (
    <nav className="grid items-start gap-1.5 px-3">
      {navItemsOperator.map((item) => (
        <NavItemOperator key={item.label} item={item} pathname={pathname} />
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <SiteNavbar />
      <div className="grid w-full md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] pt-16">
        <aside className="hidden border-r border-blue-700 bg-blue-800 md:block shadow-xl rounded-r-xl m-0 md:m-2 md:my-2 md:mr-0 overflow-hidden relative z-10">
          <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-20 items-center justify-center border-b border-blue-700 px-6 bg-gradient-to-br from-blue-800 to-blue-900">
              <Link href="/dashboard/operator" className="flex items-center gap-2.5 font-bold text-white text-lg">
                <span>Dashboard Operatore</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-5 space-y-2">
              <SidebarNavOperator />
            </div>
            <div className="mt-auto p-3 border-t border-blue-700">
              <Button
                variant="ghost"
                className="w-full justify-start text-base font-medium text-blue-200 hover:text-white hover:bg-blue-700"
                onClick={logout}
              >
                <LogOut className="mr-2.5 h-5 w-5" />
                Disconnetti
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex flex-col relative z-10">
          <header className="flex h-20 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 md:px-6 sticky top-16 z-30">
            <Suspense fallback={<div>Loading...</div>}>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Apri menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col bg-blue-800 p-0 w-[300px] border-r border-blue-700">
                  <div className="flex h-20 items-center justify-center border-b border-blue-700 px-6 bg-gradient-to-br from-blue-800 to-blue-900">
                    <Link href="/dashboard/operator" className="flex items-center gap-2.5 font-bold text-white text-lg">
                      <span>Dashboard Operatore</span>
                    </Link>
                  </div>
                  <div className="py-5 flex-1 overflow-auto">
                    <SidebarNavOperator />
                  </div>
                </SheetContent>
              </Sheet>
            </Suspense>

            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-800 capitalize">
                {pathname.split("/").pop()?.replace(/-/g, " ") || "Panoramica"}
              </h1>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 rounded-full bg-transparent">
                    <span className={cn("h-2.5 w-2.5 rounded-full", currentStatusInfo.dotClass)} />
                    <span className="font-medium">{currentStatusInfo.text}</span>
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Imposta il tuo stato</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSetStatusManually("online")}>
                    <Sun className="mr-2 h-4 w-4 text-green-500" />
                    <span>Online</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetStatusManually("paused")}>
                    <Coffee className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Pausa (20 min)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetStatusManually("offline")}>
                    <Moon className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Offline</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifiche</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 border-2 border-blue-200 shadow-sm cursor-pointer">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.stage_name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium">
                      {profile?.stage_name?.substring(0, 1).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{profile?.stage_name || profile?.full_name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile/operator" className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Modifica Profilo</span>
                    </Link>
                  </DropdownMenuItem>
                  {profile?.stage_name && (
                    <DropdownMenuItem asChild>
                      <Link href={`/operator/${encodeURIComponent(profile.stage_name)}`} className="flex items-center">
                        <View className="mr-2 h-4 w-4" />
                        <span>Vedi Profilo Pubblico</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnetti</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">
            {children}
            <IncomingChatRequestModal />
          </main>
        </div>
      </div>
    </div>
  )
}

export default function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperatorStatusProvider>
      <ChatRequestProvider>
        <OperatorDashboardLayoutContent>{children}</OperatorDashboardLayoutContent>
      </ChatRequestProvider>
    </OperatorStatusProvider>
  )
}
