"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { blogCategories } from "@/lib/blog-data"

const triggerStyles =
  "bg-transparent text-white hover:bg-white/10 focus:bg-white/10 data-[active]:bg-white/10 data-[state=open]:bg-white/10 font-medium text-sm"

const espertiLinks: { title: string; href: string; description: string }[] = [
  {
    title: "Cartomanzia",
    href: "/esperti/cartomanzia",
    description: "Svela il futuro con la saggezza delle carte.",
  },
  {
    title: "Astrologia",
    href: "/esperti/astrologia",
    description: "Leggi il tuo destino nel movimento delle stelle.",
  },
  {
    title: "Medianità",
    href: "/esperti/medianita",
    description: "Entra in contatto con le energie sottili.",
  },
  {
    title: "Tutti gli Esperti",
    href: "/esperti/tutti",
    description: "Trova la guida spirituale perfetta per te.",
  },
]

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), triggerStyles)}>Home</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerStyles}>Esperti</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-slate-50 rounded-lg shadow-lg border border-slate-100">
              {espertiLinks.map((component) => (
                <ListItem key={component.title} href={component.href} title={component.title}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/oroscopo" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), triggerStyles)}>
              Oroscopo
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerStyles}>AstroMag</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] bg-slate-50 rounded-lg shadow-lg border border-slate-100">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-50 to-blue-100 p-6 no-underline outline-none focus:shadow-md"
                    href="/astromag"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium text-slate-800">AstroMag Blog</div>
                    <p className="text-sm leading-tight text-slate-600">
                      Esplora i nostri articoli su astrologia, numerologia e spiritualità.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              {blogCategories.map((category) => (
                <ListItem key={category.name} href={`/astromag/${category.slug}`} title={category.name}>
                  {category.description}
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
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-100/50 focus:bg-blue-100/50",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none text-slate-800">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-slate-500">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"
