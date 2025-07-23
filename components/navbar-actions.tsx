"use client"

import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AuthButton } from "./auth-button" // Importa il nuovo componente
import { LayoutDashboard, User } from "lucide-react"

export function NavbarActions() {
  const { user, profile } = useAuth()

  const getDashboardUrl = () => {
    if (!profile) return "/"
    switch (profile.role) {
      case "admin":
        return "/admin"
      case "operator":
        return "/dashboard/operator"
      case "client":
        return "/dashboard/client"
      default:
        return "/"
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          className="border-sky-400 text-sky-400 hover:bg-sky-400/10 hover:text-sky-300 bg-transparent"
        >
          <Link href="/login">Accedi</Link>
        </Button>
        <Button asChild className="btn-gradient">
          <Link href="/register">Registrati</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-sky-500">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? "User"} />
            <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={getDashboardUrl()}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profilo</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Usa il nuovo componente AuthButton */}
        <DropdownMenuItem asChild>
          <AuthButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
