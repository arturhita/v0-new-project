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
  Home,
  MessageSquare,
  Star,
  CreditCard,
  User,
  Settings,
  Search,
  Calendar,
  Mail,
  LogOut,
  Bell,
  SnowflakeIcon as Crystal,
} from "lucide-react"

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [userCredits] = useState(45.5)
  const [notifications] = useState(3)

  const navigation = [
    { name: "Dashboard", href: "/dashboard/user", icon: Home },
    { name: "Cerca Consulenti", href: "/dashboard/user/search", icon: Search },
    { name: "Le Mie Consulenze", href: "/dashboard/user/consultations", icon: Calendar },
    { name: "Messaggi", href: "/dashboard/user/messages", icon: MessageSquare },
    { name: "Email Consulenze", href: "/dashboard/user/email-consultations", icon: Mail },
    { name: "Le Mie Recensioni", href: "/dashboard/user/reviews", icon: Star },
    { name: "Crediti", href: "/dashboard/user/credits", icon: CreditCard },
    { name: "Profilo", href: "/dashboard/user/profile", icon: User },
    { name: "Impostazioni", href: "/dashboard/user/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center space-x-2 mr-8">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Crystal className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              ConsultaPro
            </span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">€{userCredits.toFixed(2)}</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="Mario" />
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Mario Rossi</p>
                    <p className="text-xs leading-none text-muted-foreground">mario@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/user/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profilo</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/user/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Impostazioni</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Esci</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-sm border-r min-h-screen">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white"
                      : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.name === "Email Consulenze" && (
                    <Badge className="ml-auto bg-blue-500 text-white text-xs">2</Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
