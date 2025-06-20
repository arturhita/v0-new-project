"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Home, Users, Sparkles, Star, SnowflakeIcon as Crystal, ChevronDown, ChevronRight } from "lucide-react"

interface MobileMenuProps {
  isLoggedIn?: boolean
  userRole?: string
  userName?: string
  userCredits?: number
}

export function MobileMenu({ isLoggedIn, userRole, userName, userCredits }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expertsOpen, setExpertsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  const getDashboardLink = () => {
    switch (userRole) {
      case "admin":
        return "/dashboard/admin"
      case "operator":
        return "/dashboard/operator"
      case "user":
      default:
        return "/dashboard/user"
    }
  }

  const getCreditText = () => {
    switch (userRole) {
      case "operator":
        return "Guadagni"
      case "admin":
        return "Sistema"
      case "user":
      default:
        return "Crediti"
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-2 hover:bg-pink-50" aria-label="Apri menu">
          <Menu className="h-6 w-6 text-gray-700" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0 bg-white">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Crystal className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-800">Mysthya</span>
            </div>
            <Button variant="ghost" size="sm" onClick={closeMenu} className="p-1">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {isLoggedIn && (
            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b">
              <div className="text-sm">
                <span className="text-gray-600">Ciao, </span>
                <span className="font-semibold text-gray-800">{userName}</span>
              </div>
              {userRole !== "admin" && (
                <div className="text-sm mt-1">
                  <span className="text-gray-600">{getCreditText()}: </span>
                  <span className="font-bold text-green-600">€{userCredits?.toFixed(2) || "0.00"}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Home */}
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <Home className="h-5 w-5 text-pink-600" />
              <span className="font-medium text-gray-800">Home</span>
            </Link>

            {/* Esperti con Submenu */}
            <div>
              <button
                onClick={() => setExpertsOpen(!expertsOpen)}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-pink-600" />
                  <span className="font-medium text-gray-800">Esperti</span>
                </div>
                {expertsOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {expertsOpen && (
                <div className="ml-8 mt-2 space-y-1">
                  {[
                    { href: "/esperti/cartomanzia", label: "🔮 Cartomanzia" },
                    { href: "/esperti/astrologia", label: "⭐ Astrologia" },
                    { href: "/esperti/tarocchi", label: "🃏 Tarocchi" },
                    { href: "/esperti/sensitivi", label: "🌙 Sensitivi & Medium" },
                    { href: "/esperti/numerologia", label: "🔢 Numerologia" },
                    { href: "/esperti/cristalloterapia", label: "💎 Cristalloterapia" },
                    { href: "/esperti/rune", label: "🪬 Rune" },
                    { href: "/esperti/pendolo", label: "⚖️ Pendolo & Radiestesia" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="block p-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-25 rounded transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Novità */}
            <Link
              href="/novita"
              onClick={closeMenu}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <Sparkles className="h-5 w-5 text-pink-600" />
              <span className="font-medium text-gray-800">Novità</span>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse ml-auto"></div>
            </Link>

            {/* Oroscopo */}
            <Link
              href="/oroscopo"
              onClick={closeMenu}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <Star className="h-5 w-5 text-pink-600" />
              <span className="font-medium text-gray-800">Oroscopo</span>
              <span className="text-xs ml-auto">⭐</span>
            </Link>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-gray-50 space-y-3">
            {isLoggedIn ? (
              <Link href={getDashboardLink()} onClick={closeMenu}>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                  {userRole === "admin" ? "Admin Panel" : userRole === "operator" ? "Dashboard Pro" : "Dashboard"}
                </Button>
              </Link>
            ) : (
              <div className="space-y-2">
                <Link href="/login" onClick={closeMenu}>
                  <Button variant="outline" className="w-full border-pink-200 text-pink-600 hover:bg-pink-50">
                    Accedi
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMenu}>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                    Registrati
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
