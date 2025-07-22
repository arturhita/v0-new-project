"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import React from "react"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Cartomanti",
    href: "/esperti/cartomanti",
    description: "Esperti cartomanti pronti a svelare il tuo futuro con le carte.",
  },
  {
    title: "Astrologi",
    href: "/esperti/astrologi",
    description: "Astrologi professionisti per interpretare il tuo tema natale e le stelle.",
  },
  {
    title: "Sensitivi",
    href: "/esperti/sensitivi",
    description: "Connettiti con sensitivi dotati per una guida spirituale profonda.",
  },
  {
    title: "Tarologi",
    href: "/esperti/tarologi",
    description: "I migliori tarologi per una lettura dei tarocchi chiara e dettagliata.",
  },
]

export default function SiteNavbar() {
  const { user, profile } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getDashboardUrl = () => {
    if (profile?.role === "admin") return "/admin"
    if (profile?.role === "operator") return "/dashboard/operator"
    if (profile?.role === "client") return "/dashboard/client"
    return "/login"
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/moonthir-logo.png" alt="Moonthir Logo" width={150} height={40} />
        </Link>
        <div className="flex-grow flex justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/oroscopo" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Oroscopo</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Esperti</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {components.map((component) => (
                      <ListItem key={component.title} title={component.title} href={component.href}>
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/affinita-di-coppia" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Affinità di coppia</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/tarocchi-online" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Tarocchi Online</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/astromag" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>AstroMag</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <Button onClick={() => router.push(getDashboardUrl())}>Dashboard</Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
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
    </nav>
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
