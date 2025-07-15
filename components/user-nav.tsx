"use client"

import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserIcon, Settings, LogOut } from "lucide-react"
import { logout } from "@/lib/actions/auth.actions"

interface UserNavProps {
  user: User
}

export function UserNav({ user }: UserNavProps) {
  const getDashboardLink = () => {
    const role = user.user_metadata.role
    switch (role) {
      case "admin":
        return "/admin/dashboard"
      case "operator":
        return "/dashboard/operator"
      case "client":
      default:
        return "/dashboard/client"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src={user.user_metadata.avatar_url || ""} alt={user.user_metadata.name || user.email || ""} />
            <AvatarFallback className="bg-blue-700 text-white">
              {user.user_metadata.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg"
        align="end"
        forceMount
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-slate-900">{user.user_metadata.name || user.email}</p>
            <p className="w-[200px] truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-slate-200" />
        <DropdownMenuItem asChild>
          <Link
            href={getDashboardLink()}
            className="flex items-center text-slate-700 hover:text-blue-600 hover:bg-blue-50"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center text-slate-700 hover:text-blue-600 hover:bg-blue-50">
            <Settings className="mr-2 h-4 w-4" />
            Profilo
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200" />
        <form action={logout}>
          <button type="submit" className="w-full">
            <DropdownMenuItem className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
