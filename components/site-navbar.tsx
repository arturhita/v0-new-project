"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "./loading-spinner"
import { LogOut, User, LayoutDashboard } from "lucide-react"

const categories = [
  { title: "Cartomanzia", href: "/esperti/cartomanzia", description: "Scopri il futuro nelle carte." },
  { title: "Astrologia", href: "/esperti/astrologia", description: "Leggi il messaggio delle stelle." },
  { title: "Sensitivi", href: "/esperti/sensitivi", description: "Connettiti con l'invisibile." },
  { title: "Tarocchi", href: "/esperti/tarocchi", description: "Interpreta i simboli del destino." },
  { title: "Ritorni d'amore", href: "/esperti/ritorni-damore", description: "Ritrova la via del cuore." },
]

export function SiteNavbar() {
  const pathname = usePathname()
  const { user, profile, isLoading, logout } = useAuth()

  const getDashboardHref = () => {
    if (!profile) return "/login"
    switch (profile.role) {
      case "admin":
        return "/admin/dashboard"
      case "operator":
        return "/dashboard/operator"
      default:
        return "/dashboard/client"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="/images/moonthir-logo.png" alt="Moonthir Logo" width={120} height={30} />
        </Link>
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink active={pathname === "/"} className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Esperti</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                  {categories.map((component) => (
                    <ListItem key={component.title} title={component.title} href={component.href}>
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/astromag" legacyBehavior passHref>
                <NavigationMenuLink active={pathname.startsWith("/astromag")} className={navigationMenuTriggerStyle()}>
                  Astromag
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/diventa-esperto" legacyBehavior passHref>
                <NavigationMenuLink active={pathname === "/diventa-esperto"} className={navigationMenuTriggerStyle()}>
                  Lavora con noi
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/faq" legacyBehavior passHref>
                <NavigationMenuLink active={pathname === "/faq"} className={navigationMenuTriggerStyle()}>
                  FAQ
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {isLoading ? (
              <div className="w-[180px] flex justify-end">
                <LoadingSpinner size={24} />
              </div>
            ) : user ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-10">
                      <User className="h-5 w-5" />
                      <span className="ml-2 font-medium">{profile?.full_name || user.email}</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-3 p-4">
                        <ListItem title="Dashboard" href={getDashboardHref()}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Vai alla Dashboard
                        </ListItem>
                        <li onClick={() => logout()} className="cursor-pointer">
                          <NavigationMenuLink
                            className={cn(navigationMenuTriggerStyle(), "flex items-center justify-start w-full")}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Inizia Ora</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

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
