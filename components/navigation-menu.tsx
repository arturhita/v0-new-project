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
import { BookOpen, Users, Home } from "lucide-react"
import { getFeaturedOperatorsByCategories } from "@/lib/actions/data.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

// Type definitions
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

export function NavigationMenuDemo() {
  const [categoriesWithOperators, setCategoriesWithOperators] = React.useState<CategoryWithOperators[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const expertCategorySlugs = ["cartomanzia", "astrologia", "medianita", "numerologia"]

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getFeaturedOperatorsByCategories(expertCategorySlugs)
        setCategoriesWithOperators(data)
      } catch (error) {
        console.error("Failed to fetch operators for navigation:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const astromagLinks = [
    {
      title: "AstroMag",
      href: "/astromag",
      description: "Leggi articoli, approfondimenti e curiosità dal mondo dell'esoterismo.",
    },
    {
      title: "Oroscopo del Giorno",
      href: "/oroscopo",
      description: "Scopri cosa ti riservano le stelle oggi, segno per segno.",
    },
  ]

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "text-white bg-transparent hover:bg-white/10 focus:bg-white/10",
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white bg-transparent hover:bg-white/10 focus:bg-white/10 data-[active]:bg-white/10 data-[state=open]:bg-white/10">
            <Users className="mr-2 h-4 w-4" />
            Esperti
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[600px] grid-cols-2 gap-4 p-4 md:w-[700px] lg:w-[800px]">
              {isLoading ? (
                <MenuSkeleton />
              ) : (
                categoriesWithOperators.map((category) => (
                  <li key={category.slug} className="flex flex-col">
                    <Link href={`/esperti/${category.slug}`} passHref legacyBehavior>
                      <NavigationMenuLink className="text-base font-medium text-slate-900 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-slate-50">
                        {category.name}
                      </NavigationMenuLink>
                    </Link>
                    <ul className="mt-2 space-y-2">
                      {category.operators.length > 0 ? (
                        category.operators.map((operator) => (
                          <li key={operator.id}>
                            <Link href={`/operator/${operator.stage_name}`} passHref legacyBehavior>
                              <a className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 transition-colors">
                                <Avatar className="h-10 w-10 border-2 border-indigo-100">
                                  <AvatarImage src={operator.avatar_url || ""} alt={operator.stage_name || ""} />
                                  <AvatarFallback>{operator.stage_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-sm text-slate-800">{operator.stage_name}</p>
                                  <p className="text-xs text-slate-500">{operator.specialties?.[0] || "Esperto"}</p>
                                </div>
                              </a>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="p-2 text-sm text-slate-500">Nessun operatore in primo piano.</li>
                      )}
                    </ul>
                  </li>
                ))
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-white bg-transparent hover:bg-white/10 focus:bg-white/10 data-[active]:bg-white/10 data-[state=open]:bg-white/10">
            <BookOpen className="mr-2 h-4 w-4" />
            AstroMag
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
              {astromagLinks.map((link) => (
                <ListItem key={link.title} title={link.title} href={link.href}>
                  {link.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const MenuSkeleton = () => (
  <>
    {[...Array(4)].map((_, i) => (
      <li key={i} className="space-y-3 p-2">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </li>
    ))}
  </>
)

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
