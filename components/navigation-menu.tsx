"use client"

import * as React from "react"
import Link from "next/link"
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
import { Users, Star } from "lucide-react"

const expertCategories = [
  {
    title: "Cartomanzia",
    href: "/esperti/cartomanzia",
    description: "Svela i segreti del tuo destino con i nostri esperti cartomanti.",
  },
  {
    title: "Astrologia",
    href: "/esperti/astrologia",
    description: "Interpreta il linguaggio delle stelle e l'influenza dei pianeti.",
  },
  {
    title: "Medianità",
    href: "/esperti/medianita",
    description: "Comunica con il mondo spirituale in un ambiente sicuro e protetto.",
  },
  {
    title: "Numerologia",
    href: "/esperti/numerologia",
    description: "Scopri il potere nascosto nei numeri e le loro vibrazioni.",
  },
]

const astroMagLinks = [
  {
    title: "AstroMag",
    href: "/astromag",
    description: "Leggi gli ultimi articoli e approfondimenti dal nostro magazine.",
  },
  {
    title: "Oroscopo del Giorno",
    href: "/oroscopo",
    description: "Scopri cosa hanno in serbo le stelle per te oggi.",
  },
]

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Users className="mr-2 h-4 w-4" /> Esperti
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-[.75fr_1fr]">
              <div className="row-span-3 flex flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                <div className="mb-2 mt-4 text-lg font-medium text-white">I nostri Esperti</div>
                <p className="text-sm leading-tight text-white/80">
                  Trova la guida giusta per te. Cartomanti, astrologi e sensitivi pronti ad ascoltarti.
                </p>
                <Link href="/esperti" passHref legacyBehavior>
                  <a className="mt-4 text-sm font-bold text-yellow-300 hover:text-yellow-400">
                    Vedi tutti gli esperti →
                  </a>
                </Link>
              </div>
              {expertCategories.map((component) => (
                <ListItem key={component.title} href={component.href} title={component.title}>
                  {component.description}
                </ListItem>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Star className="mr-2 h-4 w-4" /> AstroMag
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              {astroMagLinks.map((component) => (
                <ListItem key={component.title} href={component.href} title={component.title}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
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
