"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, LayoutDashboard } from "lucide-react"

export function SiteNavbar() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getDashboardLink = () => {
    if (!profile) return "/login"
    if (profile.role === "admin") return "/admin"
    if (profile.role === "operator") return "/(platform)/dashboard/operator"
    return "/(platform)/dashboard/client"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={32} height={32} />
          <span className="font-bold text-xl text-white">Moonthir</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/esperti/cartomanzia" className="transition-colors hover:text-white">
            Cartomanzia
          </Link>
          <Link href="/esperti/astrologia" className="transition-colors hover:text-white">
            Astrologia
          </Link>
          <Link href="/esperti/sensitivi" className="transition-colors hover:text-white">
            Sensitivi
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-slate-700" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Image
                    src={profile?.avatar_url || "/placeholder.svg?width=40&height=40&query=user+avatar"}
                    alt="User avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || "Utente"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/(platform)/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profilo</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Esci</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                asChild
                className="border-slate-600 text-white hover:bg-slate-800 hover:text-white bg-transparent"
              >
                <Link href="/(platform)/login">Accedi</Link>
              </Button>
              <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-500">
                <Link href="/(platform)/register">Registrati</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
