"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, CreditCard, Bell, HelpCircle } from "lucide-react"
import LogoutButton from "./logout-button"
import Link from "next/link"

interface UserProfile {
  full_name: string | null
  email?: string | null
  avatar_url: string | null
  role: "user" | "operator" | "admin"
  credits?: number | string | null
}

interface UserNavProps {
  user: UserProfile
}

export function UserNav({ user }: UserNavProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const profileLink = `/dashboard/${user.role}/profile`
  const settingsLink = `/dashboard/${user.role}/settings`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 ring-2 ring-pink-200/80">
            <AvatarImage
              src={user.avatar_url || "/placeholder.svg?height=32&width=32"}
              alt={user.full_name || "User"}
            />
            <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.full_name || "Utente"}</p>
            {user.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={profileLink}>
              <User className="mr-2 h-4 w-4" />
              <span>Profilo</span>
            </Link>
          </DropdownMenuItem>
          {user.role !== "admin" && user.credits != null && (
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>
                {user.role === "operator" ? "Guadagni" : "Crediti"}: {user.credits}
              </span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifiche</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Supporto</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={settingsLink}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Impostazioni</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
