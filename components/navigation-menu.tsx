"use client"

import * as React from "react"
import Link from "next/link"
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
import { Users } from "lucide-react"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Cartomanzia",
    href: "/esperti/cartomanzia",
    description: "Scopri cosa ti riservano i tarocchi con i nostri esperti cartomanti.",
  },
  {
    title: "Astrologia",
    href: "/esperti/astrologia",
    description: "Interpreta il tuo tema natale e le posizioni dei pianeti.",
  },
  {
    title: "Benessere Spirituale",
    href: "/esperti/benessere",
    description: "Trova equilibrio e serenità con i nostri consulenti olistici.",
  },
  {
    title: "Tutti gli Esperti",
    href: "/esperti",
    description: "Sfoglia l'elenco completo di tutti i nostri professionisti.",
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
          <Link href="/oroscopo" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Oroscopo</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/astromag" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>AstroMag</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/diventa-esperto" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-yellow-400 text-blue-900 hover:bg-yellow-300 focus:bg-yellow-300 font-bold",
              )}
            >
              <Users className="mr-2 h-4 w-4" /> Lavora con Noi
            </NavigationMenuLink>
          </Link>
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
