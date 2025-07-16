"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { NavigationMenuDemo } from "@/components/navigation-menu"
import { User, LogOut, Menu, X } from "lucide-react"
import { logout } from "@/lib/actions/auth.actions"

interface MobileNavProps {
  user: SupabaseUser | null
}

export function MobileNav({ user }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [pathname])

  const getDashboardLink = () => {
    if (!user) return "/login"
    const userRole = user.user_metadata.role || "client"
    switch (userRole) {
      case "admin":
        return "/admin/dashboard"
      case "operator":
        return "/dashboard/operator"
      default:
        return "/dashboard/client"
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-white hover:bg-white/10"
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 md:hidden bg-[#1E3C98]/95 backdrop-blur-lg pb-8 animate-in fade-in-20 slide-in-from-top-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col space-y-4">
            <NavigationMenuDemo />
            <div className="flex flex-col space-y-2 pt-4 border-t border-blue-700">
              {user ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-center text-white border-blue-600 bg-blue-700"
                  >
                    <Link href={getDashboardLink()}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <form action={logout}>
                    <Button type="submit" variant="ghost" className="w-full justify-center text-slate-300">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] w-full justify-center font-semibold bg-transparent"
                  >
                    <Link href="/login">Accedi</Link>
                  </Button>
                  <Button
                    asChild
                    className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-md w-full justify-center"
                  >
                    <Link href="/register">Inizia Ora</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
