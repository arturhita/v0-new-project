"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Loader2, LogOut, UserCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function SiteNavbar() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const getDashboardLink = () => {
    if (!user) return "/login"
    switch (user.role) {
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

  const renderUserMenu = () => {
    if (loading) {
      return <div className="h-10 w-24 rounded-md bg-white/10 animate-pulse" />
    }

    if (isAuthenticated && user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="bg-blue-700 text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
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
                <p className="text-sm font-medium leading-none text-slate-900">{user.name}</p>
                <p className="text-xs leading-none text-slate-500">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={getDashboardLink()}
                className="flex items-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex items-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Profilo</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Esci</span>
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/moonthir-logo.png" alt="Moonthir Logo" width={120} height={40} />
            </Link>
            <div className="hidden md:block">
              <NavigationMenu className="ml-10">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Esperti</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/esperti/cartomanzia"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">Cartomanzia</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Scopri il futuro con la lettura dei tarocchi.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        {/* Add other categories here */}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/oroscopo" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>Oroscopo</NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  {/* Add other links here */}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Ciao, {user.user_metadata.full_name || user.email}</span>
                  <Button variant="ghost" size="icon" onClick={() => (window.location.href = getDashboardLink())}>
                    <UserCircle className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Button asChild variant="ghost">
                    <Link href="/login">Accedi</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Registrati</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMenuOpen ? <LogOut className="h-6 w-6" /> : <UserCircle className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>
      {isMenuOpen && (
        <div className="md:hidden bg-[#1E3C98]/95 backdrop-blur-lg pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col space-y-4">
            <NavigationMenu className="ml-10">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Esperti</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/esperti/cartomanzia"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Cartomanzia</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Scopri il futuro con la lettura dei tarocchi.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {/* Add other categories here */}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/oroscopo" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Oroscopo</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                {/* Add other links here */}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex flex-col space-y-2 pt-4 border-t border-blue-700">
              {isAuthenticated && user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-white border-blue-600 bg-blue-700"
                    asChild
                  >
                    <Link href={getDashboardLink()}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button onClick={logout} variant="ghost" className="w-full justify-center text-slate-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] w-full justify-center font-semibold bg-transparent"
                    asChild
                  >
                    <Link href="/login">Accedi</Link>
                  </Button>
                  <Button
                    className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-md w-full justify-center"
                    asChild
                  >
                    <Link href="/register">Inizia Ora</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
