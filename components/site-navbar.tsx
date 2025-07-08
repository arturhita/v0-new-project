"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { NavigationMenuMain } from "@/components/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, UserIcon, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"

export function SiteNavbar() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 md:px-6 bg-black bg-opacity-50 backdrop-blur-lg border-b border-slate-800">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={140} height={40} priority />
      </Link>
      <div className="hidden md:flex">
        <NavigationMenuMain />
      </div>
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="h-10 w-24 bg-slate-800 animate-pulse rounded-md" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-indigo-400">
                  <AvatarImage src={user.avatar_url || ""} alt={user.full_name || "User"} />
                  <AvatarFallback className="bg-indigo-900 text-indigo-300 font-bold">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-900 border-slate-700 text-white" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-slate-400">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={() => router.push(getDashboardLink())}
                className="cursor-pointer hover:bg-slate-800"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              {user.role === "client" && (
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/client/wallet")}
                  className="cursor-pointer hover:bg-slate-800"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Credito: {user.wallet_balance?.toFixed(2) ?? "0.00"}€</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer hover:bg-slate-800">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profilo</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-400 hover:bg-red-500/20 hover:!text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="text-white hover:bg-slate-800 hover:text-white">
              <Link href="/login">Accedi</Link>
            </Button>
            <Button asChild className="bg-white text-indigo-700 font-bold hover:bg-slate-200">
              <Link href="/register">Registrati</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
