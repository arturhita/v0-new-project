"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface OperatorMobileSidebarProps {
  navigation: NavItem[]
}

export function OperatorMobileSidebar({ navigation }: OperatorMobileSidebarProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
        <Menu className="h-4 w-4" />
      </Button>

      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard Operatore
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="mt-4 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-pink-100 to-blue-100 text-pink-700 border-r-2 border-pink-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-4 w-4 ${isActive ? "text-pink-600" : "text-gray-400 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                  {item.name === "Richieste Chat" && (
                    <Badge className="ml-auto bg-orange-500 text-white text-xs">2</Badge>
                  )}
                  {item.name === "🏆 Premi" && <Badge className="ml-auto bg-yellow-500 text-white text-xs">NEW</Badge>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
