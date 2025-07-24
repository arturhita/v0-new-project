"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useRouter } from "next/navigation"
import LoadingSpinner from "./loading-spinner"

// Ripristinata la versione originale della Navbar
export default function SiteNavbar() {
  const { profile, logout, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/") // Reindirizza alla home dopo il logout
  }

  const getDashboardLink = () => {
    if (!profile) return "/login"
    switch (profile.role) {
      case "admin":
        return "/admin"
      case "operator":
        return "/dashboard/operator"
      case "client":
      default:
        return "/dashboard/client"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/moonthir-logo.png"
            alt="Moonthir Logo"
            width={120}
            height={30}
            className="object-contain"
          />
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/esperti/cartomanzia" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Esperti</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/astromag" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>AstroMag</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/diventa-esperto" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Lavora con noi</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <LoadingSpinner />
          ) : isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => router.push(getDashboardLink())}>
                Dashboard
              </Button>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
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
