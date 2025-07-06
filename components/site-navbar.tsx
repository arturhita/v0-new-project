"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth.actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, LogOut, User } from "lucide-react"

const navLinks = [
  { name: "Esperti", href: "/esperti/cartomanzia" },
  { name: "Oroscopo", href: "/oroscopo" },
  { name: "Affinità di Coppia", href: "/affinita-di-coppia" },
  { name: "Tarocchi Online", href: "/tarocchi-online" },
  { name: "Astromag", href: "/astromag" },
]

export function SiteNavbar() {
  const { user, profile, loading } = useAuth()

  const getDashboardLink = () => {
    if (!profile) return "/"
    switch (profile.role) {
      case "admin":
        return "/admin/dashboard"
      case "operator":
        return "/dashboard/operator"
      case "client":
        return "/dashboard/client"
      default:
        return "/"
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={40} height={40} />
          <span className="text-xl font-bold text-white">Moonthir</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-24 bg-slate-700 rounded-md animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.profile_image_url || ""} alt={profile?.full_name || "Utente"} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-slate-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700">
                  <Link href={getDashboardLink()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profilo</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <form action={signOut}>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700">
                    <button type="submit" className="w-full text-left">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-500/20 hover:text-white bg-transparent"
                asChild
              >
                <Link href="/login">Accedi</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/register">Registrati</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
