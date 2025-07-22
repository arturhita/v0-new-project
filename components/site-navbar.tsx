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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export function SiteNavbar() {
  const { user, profile, logout, isAuthenticated, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [pathname])

  const getDashboardLink = () => {
    if (!profile) return "/login"
    switch (profile.role) {
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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return user?.email?.charAt(0).toUpperCase() || "U"
  }

  const renderAuthSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-24 bg-slate-700" />
          <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
        </div>
      )
    }

    if (isAuthenticated) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                <AvatarFallback className="bg-blue-700 text-white">{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white shadow-lg"
            align="end"
            forceMount
          >
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{profile?.full_name || user?.email}</p>
                <p className="w-[200px] truncate text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-slate-700" />
            {profile && (
              <DropdownMenuItem asChild>
                <Link href={getDashboardLink()} className="flex items-center hover:bg-slate-800 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center hover:bg-slate-800 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Profilo
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center text-red-400 hover:!text-red-400 hover:!bg-red-900/50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Esci
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

  const renderMobileAuthSection = () => {
    if (isLoading) {
      return <Skeleton className="h-10 w-full rounded-md bg-slate-700" />
    }
    if (isAuthenticated) {
      return (
        <>
          {profile && (
            <Button asChild variant="outline" className="w-full justify-center text-white border-blue-600 bg-blue-700">
              <Link href={getDashboardLink()}>
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          )}
          <Button onClick={logout} variant="ghost" className="w-full justify-center text-slate-300">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </>
      )
    }
    return (
      <>
        <Button
          asChild
          variant="outline"
          className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] w-full justify-center font-semibold bg-transparent"
        >
          <Link href="/login">Accedi</Link>
        </Button>
        <Button
          asChild
          className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-md w-full justify-center"
        >
          <Link href="/register">Inizia Ora</Link>
        </Button>
      </>
    )
  }

  return (
    <header className="bg-transparent">
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

          <div className="hidden md:flex items-center space-x-4">{renderAuthSection()}</div>

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
        <div className="md:hidden bg-[#0B112B]/95 backdrop-blur-lg pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col space-y-4">
            <NavigationMenuDemo />
            <div className="flex flex-col space-y-2 pt-4 border-t border-blue-800">{renderMobileAuthSection()}</div>
          </div>
        </div>
      )}
    </header>
  )
}
