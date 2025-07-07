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
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white",
            pathname ===
              `/dashboard/operator${item.href === "/dashboard/operator" ? "" : item.replace("/dashboard/operator", "")}` &&
              "bg-gray-800 text-white shadow-inner",
            pathname.startsWith(item.href) &&
              item.href !== "/dashboard/operator" &&
              "bg-gray-800 text-white shadow-inner",
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  )
}
