"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutGrid, LogOut, Wallet } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Esperti", href: "/esperti" },
  { name: "Oroscopo", href: "/oroscopo" },
  { name: "Affinità di Coppia", href: "/affinita-di-coppia" },
  { name: "Tarocchi Online", href: "/tarocchi-online" },
  { name: "AstroMag", href: "/astromag" },
]

export function SiteNavbar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  const getInitials = (name: string) => {
    if (!name) return "U"
    const names = name.split(" ")
    if (names.length > 1) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0)
    }
    return name.charAt(0)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={120} height={30} />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-purple-400",
                  pathname === link.href ? "text-purple-400" : "text-slate-300",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-purple-500">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {getInitials(profile?.full_name || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-slate-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {profile?.role === "client" && (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-700">
                      <Link href="/dashboard/client">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-700">
                      <Link href="/dashboard/client/wallet">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Il Mio Wallet</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {profile?.role === "operator" && (
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-700">
                    <Link href="/dashboard/operator">
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      <span>Dashboard Operatore</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer focus:bg-slate-700 focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild className="text-white hover:bg-slate-800 hover:text-purple-400">
                <Link href="/login">Accedi</Link>
              </Button>
              <Button asChild className="bg-purple-600 text-white hover:bg-purple-500">
                <Link href="/register">Registrati</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
