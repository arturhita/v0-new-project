"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, UserIcon, LogOut } from "lucide-react"
import { NavigationMenuDemo } from "@/components/navigation-menu"
import { logout } from "@/lib/actions/auth.actions"

export function MobileNav({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const getDashboardLink = () => {
    if (!user) return "/login"
    const role = user.user_metadata?.role
    switch (role) {
      case "admin":
        return "/admin/dashboard"
      case "operator":
        return "/dashboard/operator"
      case "client":
      default:
        return "/dashboard/client"
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-white/10">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#1E3C98]/95 backdrop-blur-lg pb-8 md:hidden animate-in fade-in-20 slide-in-from-top-4">
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
                      <UserIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-center text-slate-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
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
