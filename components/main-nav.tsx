"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SnowflakeIcon as Crystal } from "lucide-react"

import { cn } from "@/lib/utils"
import { MobileMenu } from "@/components/mobile-menu"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"

export function MainNav() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [user, setUser] = React.useState(null) // In a real app, get this from context or session

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/esperti", label: "Esperti" },
    { href: "/oroscopo", label: "Oroscopo" },
    { href: "/novita", label: "Novità" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-md" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Crystal className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              ConsultaPro
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-pink-600",
                  pathname === link.href ? "text-pink-600" : "text-gray-600",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserNav />
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-pink-500 to-blue-500 text-white">
                  <Link href="/login">Registrati</Link>
                </Button>
              </>
            )}
          </div>
          <div className="md:hidden">
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </header>
  )
}
