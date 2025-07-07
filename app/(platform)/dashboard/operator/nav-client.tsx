"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface NavClientProps {
  navItems: NavItem[]
}

export function NavClient({ navItems }: NavClientProps) {
  const pathname = usePathname()

  return (
    <>
      {navItems.map((item) => {
        const isActive =
          (item.href === "/dashboard/operator" && pathname === item.href) ||
          (item.href !== "/dashboard/operator" && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-r-lg px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 ease-in-out hover:bg-slate-800/60 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-primary/10 text-white border-l-4 border-primary -ml-1 pl-5 font-semibold"
                : "border-l-4 border-transparent",
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}
