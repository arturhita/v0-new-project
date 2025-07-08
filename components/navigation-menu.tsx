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
import { BookOpen, Users, Sparkles } from "lucide-react"

const expertCategories: { title: string; href: string; description: string }[] = [
  {
    title: "Cartomanti",
    href: "/esperti/cartomanti",
    description: "Lettura delle carte per svelare passato, presente e futuro.",
  },
  {
    title: "Astrologi",
    href: "/esperti/astrologi",
    description: "Interpretazione del tema natale e dei transiti planetari.",
  },
  {
    title: "Tarologi",
    href: "/esperti/tarologi",
    description: "Approfondimenti e guida attraverso la saggezza dei Tarocchi.",
  },
  {
    title: "Sensitivi",
    href: "/esperti/sensitivi",
    description: "Connessioni e percezioni per offrirti una guida spirituale.",
  },
]

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white bg-transparent hover:bg-white/10 focus:bg-white/10 data-[active]:bg-white/10 data-[state=open]:bg-white/10">
            <Users className="mr-2 h-4 w-4" />
            Esperti
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/esperti"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                    <div className="mb-2 mt-4 text-lg font-medium text-slate-900">Trova il tuo Esperto</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Connettiti con i migliori professionisti del settore esoterico.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              {expertCategories.map((component) => (
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
              className={cn(
                navigationMenuTriggerStyle(),
                "text-white bg-transparent hover:bg-white/10 focus:bg-white/10",
              )}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              AstroMag
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
