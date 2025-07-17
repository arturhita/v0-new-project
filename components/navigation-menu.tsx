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
import { BookOpen, Users, Sparkles, Home, Briefcase } from "lucide-react"
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
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {isLoading ? (
                <MenuSkeleton />
              ) : (
                <>
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-indigo-900/50 to-indigo-800 p-6 no-underline outline-none focus:shadow-md"
                        href="/esperti"
                      >
                        <Sparkles className="h-6 w-6 text-yellow-400" />
                        <div className="mb-2 mt-4 text-lg font-medium text-white">Trova il tuo Esperto</div>
                        <p className="text-sm leading-tight text-white/80">
                          Connettiti con i migliori professionisti del settore esoterico.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  {categoriesWithOperators.map((category) => (
                    <div key={category.slug}>
                      <Link href={`/esperti/${category.slug}`} passHref legacyBehavior>
                        <a className="font-medium text-slate-800 hover:text-indigo-600 block p-2 rounded-md hover:bg-slate-50">
                          {category.name}
                        </a>
                      </Link>
                      <ul className="mt-1 space-y-1">
                        {category.operators.map((operator) => (
                          <li key={operator.id}>
                            <Link href={`/operator/${operator.stage_name}`} passHref legacyBehavior>
                              <a className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100 transition-colors">
                                <Avatar className="h-8 w-8 border-2 border-indigo-100">
                                  <AvatarImage src={operator.avatar_url || ""} alt={operator.stage_name || ""} />
                                  <AvatarFallback>{operator.stage_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-xs text-slate-700">{operator.stage_name}</p>
                                  <p className="text-xs text-slate-500">{operator.specialties?.[0] || "Esperto"}</p>
                                </div>
                              </a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </div>
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

        <NavigationMenuItem>
          <Link href="/diventa-esperto" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "text-white bg-transparent hover:bg-white/10 focus:bg-white/10",
              )}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Lavora con noi
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const MenuSkeleton = () => (
  <>
    <li className="row-span-3">
      <Skeleton className="h-full w-full" />
    </li>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
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
