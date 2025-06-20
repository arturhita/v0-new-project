"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Calendar,
  CreditCard,
  Settings,
  BarChart3,
  UserCheck,
  Video,
  Star,
  Phone,
  Search,
  SnowflakeIcon as Crystal,
  Sparkles,
  MessageSquare,
} from "lucide-react"

interface MainNavProps {
  role: "user" | "operator" | "admin"
}

export function MainNav({ role }: MainNavProps) {
  const pathname = usePathname()

  const getNavItems = () => {
    switch (role) {
      case "admin":
        return [
          { href: "/dashboard/admin", label: "Dashboard", icon: BarChart3 },
          { href: "/dashboard/admin/users", label: "Utenti", icon: Users },
          { href: "/dashboard/admin/operators", label: "Consulenti", icon: UserCheck },
          { href: "/dashboard/admin/consultations", label: "Consulenze", icon: Sparkles },
          { href: "/dashboard/admin/payments", label: "Pagamenti", icon: CreditCard },
          { href: "/dashboard/admin/categories", label: "Categorie", icon: Crystal },
          { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/dashboard/admin/settings", label: "Impostazioni", icon: Settings },
        ]
      case "operator":
        return [
          { href: "/dashboard/operator", label: "Dashboard", icon: BarChart3 },
          { href: "/dashboard/operator/messages", label: "Messaggi", icon: MessageSquare },
          { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
          { href: "/dashboard/operator/consultations", label: "Consulenze", icon: Sparkles },
          { href: "/dashboard/operator/calls", label: "Chiamate", icon: Phone },
          { href: "/dashboard/operator/video", label: "Video", icon: Video },
          { href: "/dashboard/operator/earnings", label: "Guadagni", icon: CreditCard },
          { href: "/dashboard/operator/reviews", label: "Recensioni", icon: Star },
          { href: "/dashboard/operator/profile", label: "Profilo", icon: Settings },
        ]
      case "user":
      default:
        return [
          { href: "/dashboard/user", label: "Dashboard", icon: BarChart3 },
          { href: "/dashboard/user/search", label: "Cerca Consulenti", icon: Search },
          { href: "/dashboard/user/messages", label: "Messaggi", icon: MessageSquare },
          { href: "/dashboard/user/consultations", label: "Consulenze", icon: Sparkles },
          { href: "/dashboard/user/calls", label: "Chiamate", icon: Phone },
          { href: "/dashboard/user/video", label: "Video", icon: Video },
          { href: "/dashboard/user/favorites", label: "Preferiti", icon: Star },
          { href: "/dashboard/user/credits", label: "Crediti", icon: CreditCard },
          { href: "/dashboard/user/profile", label: "Profilo", icon: Settings },
        ]
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-pink-600 dark:text-pink-400" : "text-muted-foreground hover:text-pink-600",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
