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
import { getFeaturedOperatorsByCategory } from "@/lib/actions/data.actions"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface Operator {
  id: string
  stage_name: string | null
  avatar_url: string | null
  specialties: string[] | null
}

interface CategoryWithOperators {
  name: string
  slug: string
  operators: Operator[]
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

export function NavigationMenuDemo() {
  const [categoriesWithOperators, setCategoriesWithOperators] = React.useState<CategoryWithOperators[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const categories = [
    { name: "Cartomanzia", slug: "cartomanzia" },
    { name: "Astrologia", slug: "astrologia" },
    { name: "Numerologia", slug: "numerologia" },
    { name: "Medianità", slug: "medianita" },
  ]

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const data = await getFeaturedOperatorsByCategory(categories.map((c) => c.slug))
      setCategoriesWithOperators(data)
      setIsLoading(false)
    }
    fetchData()
  }, [])

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
            <div className="grid w-[600px] grid-cols-2 gap-3 p-4 md:w-[700px] lg:w-[800px]">
              {isLoading
                ? // Skeleton loader
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-2 animate-pulse">
                      <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                      <div className="space-y-3">
                        {[...Array(2)].map((_, j) => (
                          <div key={j} className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                : // Contenuto reale
                  categoriesWithOperators.map((category) => (
                    <div key={category.slug} className="flex flex-col">
                      <Link href={`/esperti/${category.slug}`} passHref legacyBehavior>
                        <NavigationMenuLink className="text-lg font-medium text-slate-800 hover:text-blue-600 px-3 py-2 rounded-md">
                          {category.name}
                        </NavigationMenuLink>
                      </Link>
                      <div className="flex-1 flex flex-col justify-start space-y-2 mt-1">
                        {category.operators.slice(0, 2).map((operator) => (
                          <Link key={operator.id} href={`/operator/${operator.stage_name}`} passHref legacyBehavior>
                            <a className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 transition-colors">
                              <Avatar className="h-10 w-10 border-2 border-blue-200">
                                <AvatarImage src={operator.avatar_url || ""} alt={operator.stage_name || ""} />
                                <AvatarFallback>{operator.stage_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-sm text-slate-700">{operator.stage_name}</p>
                                <p className="text-xs text-slate-500">
                                  {operator.specialties ? operator.specialties[0] : "Esperto"}
                                </p>
                              </div>
                            </a>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/oroscopo" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Oroscopo</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/astromag" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Astromag</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/diventa-esperto" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Lavora con noi</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
