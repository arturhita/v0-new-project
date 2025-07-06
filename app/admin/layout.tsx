"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Star,
  FileText,
  UserCheck,
  PenLine,
  DollarSign,
  Zap,
  Shield,
  Menu,
  MessageSquare,
  Trophy,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/operators", label: "Operatori", icon: Briefcase },
  { href: "/admin/operator-approvals", label: "Approvazioni", icon: UserCheck, badge: 3 },
  { href: "/admin/reviews", label: "Recensioni", icon: Star },
  { href: "/admin/tickets", label: "Ticket Supporto", icon: MessageSquare },
  { href: "/admin/blog-management", label: "Blog", icon: PenLine },
  { href: "/admin/promotions", label: "Promozioni", icon: Zap },
  { href: "/admin/payouts", label: "Pagamenti", icon: DollarSign },
  { href: "/admin/gamification", label: "Gamification", icon: Trophy },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

const settingsItems = [
  { href: "/admin/settings", label: "Generali", icon: Settings },
  { href: "/admin/settings/advanced", label: "Avanzate", icon: Shield },
  { href: "/admin/settings/legal", label: "Testi Legali", icon: FileText },
]

function AdminSidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <h3 className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Generale</h3>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-indigo-500/10",
            pathname === item.href && "bg-indigo-500/20 text-white",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
          {item.badge && (
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/80">
              {item.badge}
            </Badge>
          )}
        </Link>
      ))}
      <h3 className="px-2 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Impostazioni</h3>
      {settingsItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-indigo-500/10",
            pathname === item.href && "bg-indigo-500/20 text-white",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth()

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-900 text-white">
      <div className="hidden border-r border-indigo-500/20 bg-slate-900/50 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-indigo-500/20 px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={24} height={24} />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                Moonthir Admin
              </span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AdminSidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-indigo-500/20 bg-slate-900/50 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent border-slate-700">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-slate-900 border-r-slate-800 text-white">
              <div className="flex h-14 items-center border-b border-indigo-500/20 px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                  <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={24} height={24} />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                    Moonthir Admin
                  </span>
                </Link>
              </div>
              <div className="overflow-y-auto">
                <AdminSidebarNav />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">{/* Puoi aggiungere una barra di ricerca qui se vuoi */}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full bg-slate-800 hover:bg-slate-700">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.profile_image_url || ""} alt={profile?.full_name || "Admin"} />
                  <AvatarFallback className="bg-indigo-500">
                    {profile?.full_name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                  <p className="text-xs leading-none text-slate-400">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="cursor-pointer">
                  Profilo
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  Impostazioni
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={logout} className="text-red-400 cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
