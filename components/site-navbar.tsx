"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NavigationMenuDemo } from "@/components/navigation-menu"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from "@/lib/actions/auth.actions"
import { User, LogOut, LayoutDashboard } from "lucide-react"

export function SiteNavbar() {
  const { user, profile } = useAuth()
  const pathname = usePathname()

  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getDashboardLink = () => {
    if (!profile) return "/login"
    switch (profile.role) {
      case "admin":
        return "/admin/dashboard"
      case "operator":
        return "/(platform)/dashboard/operator"
      case "client":
        return "/(platform)/dashboard/client"
      default:
        return "/login"
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    const names = name.split(" ")
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const isTransparentPage = pathname === "/"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || !isTransparentPage
          ? "bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 shadow-lg"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={40} priority />
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenuDemo />
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-transparent hover:border-yellow-400 transition-colors">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "User"} />
                    <AvatarFallback className="bg-indigo-800 text-white font-bold">
                      {getInitials(profile?.name || user.email || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-900 text-white border-slate-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.name || "Utente"}</p>
                    <p className="text-xs leading-none text-slate-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild className="cursor-pointer hover:!bg-slate-800">
                  <Link href={getDashboardLink()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:!bg-slate-800">
                  <Link href="/(platform)/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profilo</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  onSelect={async () => {
                    await logout()
                  }}
                  className="cursor-pointer text-red-400 hover:!bg-red-900/50 hover:!text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                <Link href="/login">Accedi</Link>
              </Button>
              <Button asChild>
                <Link
                  href="/register"
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/40",
                    "h-10 px-4 py-2",
                  )}
                >
                  Inizia Ora
                </Link>
              </Button>
            </div>
          )}
          <div className="md:hidden">
            {/* Mobile Menu Trigger */}
            <Button variant="ghost" size="icon" className="text-white">
              {/* You can add a menu icon here, e.g., <Menu /> */}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
