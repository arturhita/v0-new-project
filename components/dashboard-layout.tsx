"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, MenuIcon, Search, LogOut, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import React, { Suspense } from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { useAuth } from "@/contexts/auth-context"

interface NavItemProps {
  href: string
  label: string
  icon: React.ElementType
  subItems?: NavItemProps[]
}

interface DashboardLayoutProps {
  children: React.ReactNode
  menuItems: NavItemProps[]
  sidebarHeader: React.ReactNode
  headerContent?: React.ReactNode
  sidebarBaseClasses?: string
  sidebarHeaderClasses?: string
  sidebarLinkClasses?: {
    base?: string
    active?: string
    inactive?: string
    icon?: string
    iconActive?: string
  }
}

const NavItem = ({
  item,
  pathname,
  linkClasses,
}: {
  item: NavItemProps
  pathname: string
  linkClasses?: DashboardLayoutProps["sidebarLinkClasses"]
}) => {
  const isActive = item.href ? pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) : false

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out group",
        linkClasses?.base,
        isActive ? linkClasses?.active : linkClasses?.inactive,
      )}
    >
      <item.icon className={cn("h-5 w-5", linkClasses?.icon, isActive && linkClasses?.iconActive)} />
      <span>{item.label}</span>
    </Link>
  )
}

const CollapsibleNavItem = ({
  item,
  pathname,
  linkClasses,
}: {
  item: NavItemProps
  pathname: string
  linkClasses?: DashboardLayoutProps["sidebarLinkClasses"]
}) => {
  const [isOpen, setIsOpen] = React.useState(item.subItems?.some((sub) => sub.href && pathname.startsWith(sub.href)))

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
          linkClasses?.base,
        )}
      >
        <div className="flex items-center gap-3.5">
          <item.icon className={cn("h-5 w-5", linkClasses?.icon)} />
          <span>{item.label}</span>
        </div>
        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && item.subItems && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-200 pl-3.5">
          {item.subItems.map((subItem) => (
            <NavItem key={subItem.href} item={subItem} pathname={pathname} linkClasses={linkClasses} />
          ))}
        </div>
      )}
    </div>
  )
}

const SidebarNav = ({
  menuItems,
  pathname,
  linkClasses,
}: { menuItems: NavItemProps[]; pathname: string; linkClasses?: DashboardLayoutProps["sidebarLinkClasses"] }) => (
  <nav className="grid items-start gap-1.5 px-3">
    {menuItems.map((item) =>
      item.subItems && item.subItems.length > 0 ? (
        <CollapsibleNavItem key={item.label} item={item} pathname={pathname} linkClasses={linkClasses} />
      ) : (
        <NavItem key={item.href} item={item} pathname={pathname} linkClasses={linkClasses} />
      ),
    )}
  </nav>
)

export default function DashboardLayout({
  children,
  menuItems,
  sidebarHeader,
  headerContent,
  sidebarBaseClasses,
  sidebarHeaderClasses,
  sidebarLinkClasses,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const SidebarContentNav = () => (
    <SidebarNav menuItems={menuItems} pathname={pathname} linkClasses={sidebarLinkClasses} />
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <SiteNavbar />

      <div className="grid w-full md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] pt-16">
        <aside
          className={cn(
            "hidden border-r bg-white md:block shadow-lg rounded-r-2xl m-0 md:m-3 md:my-3 md:mr-0 overflow-hidden",
            sidebarBaseClasses,
          )}
        >
          <div className="flex h-full max-h-screen flex-col">
            <div className={cn("flex h-24 items-center justify-center border-b px-6", sidebarHeaderClasses)}>
              {sidebarHeader}
            </div>
            <div className="flex-1 overflow-auto py-6 space-y-4">
              <SidebarContentNav />
            </div>
            <div className="mt-auto p-4 border-t">
              <Button
                onClick={logout}
                variant="ghost"
                className={cn("w-full justify-start text-base font-medium", sidebarLinkClasses?.base)}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Disconnetti
              </Button>
            </div>
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="flex h-24 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 md:px-8 sticky top-16 z-30">
            <Suspense fallback={<div>Loading...</div>}>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-100 bg-transparent"
                  >
                    <MenuIcon className="h-7 w-7" />
                    <span className="sr-only">Apri menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className={cn("flex flex-col p-0 w-[300px]", sidebarBaseClasses)}>
                  <div className={cn("flex h-24 items-center justify-center border-b px-6", sidebarHeaderClasses)}>
                    {sidebarHeader}
                  </div>
                  <div className="py-6 flex-1 overflow-auto">
                    <SidebarContentNav />
                  </div>
                </SheetContent>
              </Sheet>
            </Suspense>
            <div className="relative w-full max-w-md flex-1 ml-auto md:ml-0">
              <Input
                type="search"
                placeholder="Cerca..."
                className="w-full rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 pl-10 py-3 text-base shadow-inner"
              />
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center gap-4 ml-auto">
              {headerContent}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100"
              >
                <Bell className="h-6 w-6" />
                <span className="sr-only">Notifiche</span>
              </Button>
              <Avatar className="h-11 w-11 border-2 border-blue-200 shadow-sm">
                <AvatarImage
                  src={user?.profile?.avatar_url || "/placeholder.svg?height=40&width=40"}
                  alt={user?.profile?.full_name || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                  {user?.profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
