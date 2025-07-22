"use client"

import React from "react"
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
import { cn } from "@/lib/utils"
import { logout } from "@/lib/actions/auth.actions"
import { useRouter } from "next/navigation"

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"

export default function SiteNavbar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    if (user.role === "admin") return "/admin"
    if (user.role === "operator") return "/dashboard/operator"
    return "/dashboard/client"
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/esperti", label: "I nostri esperti" },
    { href: "/tarocchi-online", label: "Tarocchi Online" },
    { href: "/astromag", label: "AstroMag" },
    { href: "/oroscopo", label: "Oroscopo" },
    { href: "/affinita-di-coppia", label: "Affinità di coppia" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="/images/moonthir-logo.png" alt="Moonthir Logo" width={120} height={40} />
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <Link href={link.href} legacyBehavior passHref>
                  <NavigationMenuLink active={pathname === link.href} className={navigationMenuTriggerStyle()}>
                    {link.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              <Button asChild variant="ghost">
                <Link href={getDashboardLink()}>Dashboard</Link>
              </Button>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
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
