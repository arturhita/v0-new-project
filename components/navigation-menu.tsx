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
import { Sparkles, Users, BookOpen, Sun, Moon } from "lucide-react"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Tarocchi dell'Amore",
    href: "/tarocchi-online/amore",
    description: "Scopri cosa ti riserva il futuro in amore con una lettura personalizzata.",
  },
  {
    title: "Tarocchi del Lavoro",
    href: "/tarocchi-online/lavoro",
    description: "Ottieni chiarezza sulla tua carriera e le tue finanze.",
  },
  {
    title: "Tarocchi del Giorno",
    href: "/tarocchi-online/giorno",
    description: "Una carta per guidarti attraverso la giornata con consapevolezza.",
  },
  {
    title: "Sì o No",
    href: "/tarocchi-online/si-no",
    description: "Una risposta diretta e immediata a una tua domanda specifica.",
  },
]

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/esperti" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "bg-transparent text-white hover:bg-white/10")}
            >
              <Users className="mr-2 h-4 w-4" /> Esperti
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10">
            <Sun className="mr-2 h-4 w-4" /> Oroscopo
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              <ListItem href="/oroscopo/giornaliero" title="Oroscopo del Giorno">
                Le previsioni astrologiche per oggi per tutti i segni zodiacali.
              </ListItem>
              <ListItem href="/oroscopo/settimanale" title="Oroscopo della Settimana">
                Uno sguardo agli astri per la settimana che sta per iniziare.
              </ListItem>
              <ListItem href="/oroscopo/mensile" title="Oroscopo del Mese">
                Le tendenze e i consigli delle stelle per il mese in corso.
              </ListItem>
              <ListItem href="/oroscopo/annuale" title="Oroscopo 2025">
                Scopri cosa ti riserva il nuovo anno in amore, lavoro e benessere.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/affinita-di-coppia" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "bg-transparent text-white hover:bg-white/10")}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Affinità di Coppia
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10">
            <Moon className="mr-2 h-4 w-4" /> Tarocchi Online
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/tarocchi-online"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">Lettura Tarocchi</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Esplora i misteri dei tarocchi e trova le risposte che cerchi.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              {components.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/astromag" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "bg-transparent text-white hover:bg-white/10")}
            >
              <BookOpen className="mr-2 h-4 w-4" /> Astromag
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
