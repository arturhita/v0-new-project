"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  UserCheck,
  MessageSquare,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  Bell,
  Star,
  TrendingUp,
  Shield,
  Database,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  Gift,
  DollarSign,
  AlertTriangle,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard/admin",
      icon: Home,
      badge: null,
    },
    {
      title: "Gestione",
      items: [
        {
          title: "Utenti",
          href: "/dashboard/admin/users",
          icon: Users,
          badge: "1,247",
        },
        {
          title: "Consulenti",
          href: "/dashboard/admin/consultants",
          icon: UserCheck,
          badge: "12",
          alert: true,
        },
        {
          title: "Consulenze",
          href: "/dashboard/admin/consultations",
          icon: MessageSquare,
          badge: "45",
        },
      ],
    },
    {
      title: "Finanze",
      items: [
        {
          title: "Pagamenti",
          href: "/dashboard/admin/payments",
          icon: CreditCard,
          badge: "8",
          alert: true,
        },
        {
          title: "Transazioni",
          href: "/dashboard/admin/transactions",
          icon: DollarSign,
          badge: null,
        },
        {
          title: "Fatture",
          href: "/dashboard/admin/invoices",
          icon: Receipt,
          badge: null,
        },
      ],
    },
    {
      title: "Contenuti",
      items: [
        {
          title: "Recensioni",
          href: "/dashboard/admin/reviews",
          icon: Star,
          badge: "23",
        },
        {
          title: "Premi & Bonus",
          href: "/dashboard/admin/rewards",
          icon: Gift,
          badge: null,
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        {
          title: "Statistiche",
          href: "/dashboard/admin/analytics",
          icon: BarChart3,
          badge: null,
        },
        {
          title: "Performance",
          href: "/dashboard/admin/performance",
          icon: TrendingUp,
          badge: null,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Impostazioni",
          href: "/dashboard/admin/settings",
          icon: Settings,
          badge: null,
        },
        {
          title: "Notifiche",
          href: "/dashboard/admin/notifications",
          icon: Bell,
          badge: "5",
          alert: true,
        },
        {
          title: "Backup",
          href: "/dashboard/admin/backup",
          icon: Database,
          badge: null,
        },
        {
          title: "Audit Log",
          href: "/dashboard/admin/audit",
          icon: Shield,
          badge: null,
        },
      ],
    },
  ]

  const alertsCount = menuItems.flatMap((section) => section.items || []).filter((item) => item.alert).length

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Mysthya
              </h2>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Admin Profile */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-pink-500">
            <AvatarImage src="/placeholder.svg" alt="Admin" />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500">AD</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="font-medium text-sm">Admin</p>
              <p className="text-xs text-slate-400">Amministratore</p>
              {alertsCount > 0 && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-orange-400">{alertsCount} alert</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Single item or section header */}
              {section.href ? (
                <Link href={section.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      pathname === section.href
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white",
                    )}
                  >
                    <section.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 font-medium">{section.title}</span>
                        {section.badge && (
                          <Badge variant="secondary" className="bg-slate-600 text-slate-200">
                            {section.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              ) : (
                <>
                  {!isCollapsed && (
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {section.title}
                    </div>
                  )}
                  {section.items?.map((item, itemIndex) => (
                    <Link key={itemIndex} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative",
                          pathname === item.href
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                            : "text-slate-300 hover:bg-slate-700 hover:text-white",
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 font-medium">{item.title}</span>
                            <div className="flex items-center space-x-1">
                              {item.alert && <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs",
                                    item.alert ? "bg-orange-500 text-white" : "bg-slate-600 text-slate-200",
                                  )}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          </>
                        )}
                        {isCollapsed && item.alert && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
                        )}
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="space-y-2">
          {!isCollapsed && (
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Sistema:</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>99.9%</span>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white hover:bg-slate-700">
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    </div>
  )
}
