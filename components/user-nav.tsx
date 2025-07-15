"use client"

import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserIcon, Settings, LogOut } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { logout } from "@/lib/actions/auth.actions"

type UserNavProps = {
  user: User
}

export function UserNav({ user }: UserNavProps) {
  const getDashboardLink = () => {
    if (!user) return "/login"
    const role = user.user_metadata?.role || "client"
    switch (role) {
      case "admin":
        return "/admin"
      case "operator":
        return "/dashboard/operator"
      case "client":
        return "/dashboard/client"
      default:
        return "/dashboard/client"
    }
  }

  const userEmail = user.email || ""
  const userAvatarUrl = user.user_metadata?.avatar_url || ""
  const userName = user.user_metadata?.name || userEmail.split("@")[0]
  const fallback = userName?.charAt(0).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src={userAvatarUrl || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="bg-blue-700 text-white">{fallback}</AvatarFallback>
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
            <p className="text-sm font-medium leading-none text-slate-900">{userName}</p>
            <p className="text-xs leading-none text-slate-500">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={getDashboardLink()} className="cursor-pointer w-full">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer w-full">
              <Settings className="mr-2 h-4 w-4" />
              <span>Profilo</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="flex items-center w-full cursor-pointer px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Esci</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
