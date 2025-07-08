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
import { Sparkles } from "lucide-react"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Tarocchi Online",
    href: "/tarocchi-online",
    description: "Scopri il tuo futuro con una lettura dei tarocchi personalizzata dai nostri esperti.",
  },
  {
    title: "Oroscopo del Giorno",
    href: "/oroscopo",
    description: "Leggi le previsioni astrologiche per il tuo segno zodiacale, aggiornate quotidianamente.",
  },
  {
    title: "Affinità di Coppia",
    href: "/affinita-di-coppia",
    description: "Calcola la compatibilità tra il tuo segno e quello del partner.",
  },
  {
    title: "AstroMag",
    href: "/astromag",
    description: "Il nostro magazine online con articoli, approfondimenti e curiosità astrologiche.",
  },
]

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white bg-transparent hover:bg-white/10 focus:bg-white/10 data-[active]:bg-white/10 data-[state=open]:bg-white/10">
            I Nostri Servizi
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                    <div className="mb-2 mt-4 text-lg font-medium text-slate-900">Moonthir</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      La tua guida nel mondo dell'astrologia e della cartomanzia.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/tarocchi-online" title="Tarocchi Online">
                Scopri il tuo futuro con una lettura personalizzata.
              </ListItem>
              <ListItem href="/oroscopo" title="Oroscopo del Giorno">
                Le previsioni astrologiche per il tuo segno zodiacale.
              </ListItem>
              <ListItem href="/affinita-di-coppia" title="Affinità di Coppia">
                Calcola la compatibilità con il tuo partner.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/esperti/cartomanti" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "text-white bg-transparent hover:bg-white/10 focus:bg-white/10",
              )}
            >
              Esperti
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/astromag" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "text-white bg-transparent hover:bg-white/10 focus:bg-white/10",
              )}
            >
              AstroMag
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/diventa-esperto" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "text-white bg-transparent hover:bg-white/10 focus:bg-white/10",
              )}
            >
              Lavora con Noi
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
