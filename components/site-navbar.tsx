"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, LogOut, User, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navLinks = [
  { href: "/esperti/cartomanzia", label: "Cartomanzia" },
  { href: "/esperti/astrologia", label: "Astrologia" },
  { href: "/esperti/sensitivi", label: "Sensitivi" },
  { href: "/oroscopo", label: "Oroscopo" },
  { href: "/affinita-di-coppia", label: "Affinità di coppia" },
  { href: "/tarocchi-online", label: "Tarocchi Online" },
  { href: "/astromag", label: "Astromag" },
]

export function SiteNavbar() {
  const pathname = usePathname()
  const { user, profile, logout } = useAuth()
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getDashboardLink = () => {
    if (!profile) return "/login"
    switch (profile.role) {
      case "admin":
        return "/admin"
      case "operator":
        return "/dashboard/operator"
      default:
        return "/dashboard/client"
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-indigo-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={32} height={32} />
            <span className="text-xl font-semibold text-white">Moonthir</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-slate-300 transition-colors hover:text-white",
                  pathname === link.href && "text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-indigo-400">
                        <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || "User"} />
                        <AvatarFallback className="bg-indigo-500 text-white">
                          {profile?.username ? profile.username.charAt(0).toUpperCase() : <User />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-white" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.username || "Utente"}</p>
                        <p className="text-xs leading-none text-slate-400">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()} className="cursor-pointer flex items-center w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="border-indigo-400 text-indigo-300 hover:bg-indigo-500/10 hover:text-white bg-transparent"
                  >
                    <Link href="/login">Accedi</Link>
                  </Button>
                  <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-500">
                    <Link href="/register">Registrati</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6 text-white" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-slate-900 border-l-slate-800 text-white w-full max-w-xs">
                  <div className="flex flex-col h-full">
                    <div className="py-6 space-y-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block px-4 py-2 text-lg text-slate-300 hover:text-white"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-auto border-t border-slate-800 p-4 space-y-4">
                      {user ? (
                        <>
                          <Link
                            href={getDashboardLink()}
                            className="flex items-center w-full px-4 py-2 text-lg text-slate-300 hover:text-white"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            <span>Dashboard</span>
                          </Link>
                          <button
                            onClick={() => {
                              logout()
                              setMobileMenuOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-lg text-red-400 hover:text-red-300"
                          >
                            <LogOut className="mr-2 h-5 w-5" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <Button
                            asChild
                            variant="outline"
                            className="w-full border-indigo-400 text-indigo-300 hover:bg-indigo-500/10 hover:text-white bg-transparent"
                          >
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                              Accedi
                            </Link>
                          </Button>
                          <Button asChild className="w-full bg-indigo-600 text-white hover:bg-indigo-500">
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                              Registrati
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
