"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/lib/actions/auth.actions"
import type { User } from "@supabase/supabase-js"
import { UserIcon, Settings, LogOut } from "lucide-react"

type UserNavProps = {
  user: User
}

export function UserNav({ user }: UserNavProps) {
  const getDashboardLink = () => {
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

  const name = user.user_metadata?.name || user.email
  const fallback = name?.charAt(0).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={name || ""} />
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
            <p className="text-sm font-medium leading-none text-slate-900">{name}</p>
            <p className="text-xs leading-none text-slate-500 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={getDashboardLink()}
            className="flex items-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
          >
            <UserIcon className="mr-2 h-4 w-4" />
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
        <form action={logout}>
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="w-full flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Esci</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
