"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { NavigationMenuDemo } from "@/components/navigation-menu" // <-- CORRETTO
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, UserIcon, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function SiteNavbar() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [pathname])

  const getDashboardLink = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "admin":
        return "/admin/dashboard"
      case "operator":
        return "/dashboard/operator"
      default:
        return "/dashboard/client"
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={140} height={40} priority />
          </Link>

          <div className="hidden md:flex items-center">
            <NavigationMenuDemo /> {/* <-- CORRETTO */}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="h-10 w-40 bg-slate-800 animate-pulse rounded-md" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-indigo-400/50">
                      <AvatarImage src={user.avatar_url || ""} alt={user.full_name || "User"} />
                      <AvatarFallback className="bg-indigo-900 text-indigo-300 font-bold">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-slate-900/80 backdrop-blur-md border-slate-700 text-white"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name}</p>
                      <p className="text-xs leading-none text-slate-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={() => router.push(getDashboardLink())}
                    className="cursor-pointer hover:!bg-slate-800"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="cursor-pointer hover:!bg-slate-800"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profilo</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 hover:!bg-red-500/20 hover:!text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-white hover:bg-slate-800 hover:text-white">
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button asChild className="bg-white text-indigo-700 font-bold hover:bg-slate-200">
                  <Link href="/register">Registrati</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-slate-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur-lg pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col space-y-4">
            <NavigationMenuDemo />
            <div className="flex flex-col space-y-2 pt-4 border-t border-slate-700">
              {loading ? (
                <div className="h-10 w-full bg-slate-800 animate-pulse rounded-md" />
              ) : user ? (
                <>
                  <Button
                    onClick={() => router.push(getDashboardLink())}
                    variant="outline"
                    className="w-full justify-center text-white border-slate-600 bg-slate-800"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-center text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-800 w-full justify-center bg-transparent"
                    asChild
                  >
                    <Link href="/login">Accedi</Link>
                  </Button>
                  <Button
                    className="font-bold text-indigo-700 bg-white hover:bg-slate-200 w-full justify-center"
                    asChild
                  >
                    <Link href="/register">Registrati</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
