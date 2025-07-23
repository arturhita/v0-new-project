"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { LogOut, LayoutDashboard } from "lucide-react"

export default function SiteNavbar() {
  const pathname = usePathname()
  const { user, profile, logout } = useAuth()

  const navLinks = [
    { href: "/esperti/cartomanzia", label: "Esperti" },
    { href: "/tarocchi-online", label: "Tarocchi Online" },
    { href: "/oroscopo", label: "Oroscopo" },
    { href: "/affinita-di-coppia", label: "Affinità di Coppia" },
    { href: "/astromag", label: "Astromag" },
    { href: "/diventa-esperto", label: "Lavora con noi" },
  ]

  const getDashboardUrl = () => {
    if (!profile) return "/login"
    switch (profile.role) {
      case "admin":
        return "/admin"
      case "operator":
        return "/operator/dashboard"
      case "client":
      default:
        return "/client/dashboard"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={120} height={40} />
        </Link>
        <div className="hidden lg:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={pathname.startsWith(link.href)}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href={getDashboardUrl()}>
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Accedi</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registrati</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
