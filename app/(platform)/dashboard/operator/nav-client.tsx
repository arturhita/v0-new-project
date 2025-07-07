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
        // This logic is much cleaner and correct.
        // The main dashboard link is active only on exact match.
        // Other links are active if the current path starts with their href.
        const isActive =
          (item.href === "/dashboard/operator" && pathname === item.href) ||
          (item.href !== "/dashboard/operator" && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white",
              isActive && "bg-gray-800 text-white shadow-inner",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}
