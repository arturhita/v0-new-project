"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Calendar,
  CreditCard,
  FileText,
  Home,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  Star,
  User,
  LogOut,
  Menu,
  X,
  Clock,
  Trophy,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard/operator", icon: Home },
  { name: "Consulenze", href: "/dashboard/operator/consultations", icon: Calendar },
  { name: "Richieste Chat", href: "/dashboard/operator/chat-requests", icon: Phone },
  { name: "Messaggi", href: "/dashboard/operator/messages", icon: MessageSquare },
  { name: "Email Richieste", href: "/dashboard/operator/email-requests", icon: Mail },
  { name: "Recensioni", href: "/dashboard/operator/reviews", icon: Star },
  { name: "🏆 Premi", href: "/dashboard/operator/rewards", icon: Trophy },
  { name: "Guadagni", href: "/dashboard/operator/earnings", icon: CreditCard },
  { name: "Fatture", href: "/dashboard/operator/invoices", icon: FileText },
  { name: "Disponibilità", href: "/dashboard/operator/availability", icon: Clock },
  { name: "Dati Pagamento", href: "/dashboard/operator/payment-data", icon: CreditCard },
  { name: "Profilo", href: "/dashboard/operator/profile", icon: User },
  { name: "Impostazioni", href: "/dashboard/operator/settings", icon: Settings },
]

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard Operatore
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="mt-4 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-pink-100 to-blue-100 text-pink-700 border-r-2 border-pink-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-4 w-4 ${isActive ? "text-pink-600" : "text-gray-400 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                  {item.name === "Richieste Chat" && (
                    <Badge className="ml-auto bg-orange-500 text-white text-xs">2</Badge>
                  )}
                  {item.name === "🏆 Premi" && <Badge className="ml-auto bg-yellow-500 text-white text-xs">NEW</Badge>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-xl">
          <div className="flex h-16 items-center px-4 border-b">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard Operatore
            </h2>
          </div>
          <nav className="mt-4 flex-1 px-2 pb-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-pink-100 to-blue-100 text-pink-700 border-r-2 border-pink-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-4 w-4 ${isActive ? "text-pink-600" : "text-gray-400 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                  {item.name === "Richieste Chat" && (
                    <Badge className="ml-auto bg-orange-500 text-white text-xs">2</Badge>
                  )}
                  {item.name === "🏆 Premi" && <Badge className="ml-auto bg-yellow-500 text-white text-xs">NEW</Badge>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Status Badge */}
              <Badge className="bg-green-500 text-white">Online</Badge>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Luna Stellare" />
                      <AvatarFallback>LS</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Luna Stellare</p>
                      <p className="text-xs leading-none text-muted-foreground">luna@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/operator/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profilo
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/operator/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Impostazioni
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
