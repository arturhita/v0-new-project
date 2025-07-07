"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { NavigationMenuDemo } from "@/components/navigation-menu"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, Menu, X, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function SiteNavbar() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const getDashboardLink = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "admin":
        return "/admin/dashboard"
      case "operator":
        return "/dashboard/operator"
      case "client":
        return "/dashboard/client"
      default:
        return "/dashboard/client"
    }
  }

  const renderUserMenu = () => {
    if (loading) {
      return <div className="h-10 w-24 rounded-md bg-white/10 animate-pulse" />
    }

    if (isAuthenticated && user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="bg-blue-700 text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">{user.name}</p>
                <p className="text-xs leading-none text-slate-500">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={getDashboardLink()}
                className="flex items-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex items-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Profilo</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Esci</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <>
        <Button
          asChild
          variant="outline"
          className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] font-semibold transition-colors duration-300 bg-transparent"
        >
          <Link href="/login">Accedi</Link>
        </Button>
        <Button
          asChild
          className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          <Link href="/register">Inizia Ora</Link>
        </Button>
      </>
    )
  }

  return (
    // CORREZIONE: Rimosse le classi "fixed top-0 left-0 right-0 z-50"
    <header className="bg-[#1E3C98] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir Logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center">
            <NavigationMenuDemo />
          </div>

          <div className="hidden md:flex items-center space-x-4">{renderUserMenu()}</div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#1E3C98]/95 backdrop-blur-lg pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col space-y-4">
            <NavigationMenuDemo />
            <div className="flex flex-col space-y-2 pt-4 border-t border-blue-700">
              {isAuthenticated && user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-white border-blue-600 bg-blue-700"
                    asChild
                  >
                    <Link href={getDashboardLink()}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button onClick={logout} variant="ghost" className="w-full justify-center text-slate-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] w-full justify-center font-semibold bg-transparent"
                    asChild
                  >
                    <Link href="/login">Accedi</Link>
                  </Button>
                  <Button
                    className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-md w-full justify-center"
                    asChild
                  >
                    <Link href="/register">Inizia Ora</Link>
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
