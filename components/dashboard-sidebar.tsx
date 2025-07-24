"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface DashboardSidebarProps {
  navigation: NavItem[]
  title?: string
}

export function DashboardSidebar({ navigation, title = "Dashboard" }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm border-r min-h-screen hidden lg:block">
      <div className="flex h-16 items-center px-4 border-b">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-pink-100 to-blue-100 text-pink-700 shadow-inner"
                  : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
              {/* Example of dynamic badges */}
              {item.name === "Email Consulenze" && <Badge className="ml-auto bg-blue-500 text-white text-xs">2</Badge>}
              {item.name === "Richieste Chat" && <Badge className="ml-auto bg-orange-500 text-white text-xs">2</Badge>}
              {item.name === "🏆 Premi" && <Badge className="ml-auto bg-yellow-500 text-white text-xs">NEW</Badge>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
