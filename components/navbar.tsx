"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogIn } from "lucide-react"
import { NavigationMenuDemo } from "@/components/navigation-menu"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-sky-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/unveilly-logo.png" alt="Unveilly" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
              Unveilly
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenuDemo />
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sky-300 hover:text-white hover:bg-sky-900/20">
                <LogIn className="h-4 w-4 mr-2" />
                Accedi
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600">
                <User className="h-4 w-4 mr-2" />
                Registrati
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-sky-300 hover:text-white">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-sky-500/20">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-sky-300 hover:text-white px-4 py-2" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <div className="px-4">
                <div className="text-sky-300 font-medium mb-2">Maestri</div>
                <div className="pl-4 space-y-2">
                  <Link href="/maestri/cartomanzia" className="block text-slate-300 hover:text-white py-1">
                    Cartomanzia
                  </Link>
                  <Link href="/maestri/astrologia" className="block text-slate-300 hover:text-white py-1">
                    Astrologia
                  </Link>
                  <Link href="/maestri/numerologia" className="block text-slate-300 hover:text-white py-1">
                    Numerologia
                  </Link>
                  <Link href="/maestri/canalizzazione" className="block text-slate-300 hover:text-white py-1">
                    Canalizzazione
                  </Link>
                  <Link href="/maestri/guarigione-energetica" className="block text-slate-300 hover:text-white py-1">
                    Guarigione Energetica
                  </Link>
                  <Link href="/maestri/rune" className="block text-slate-300 hover:text-white py-1">
                    Rune
                  </Link>
                  <Link href="/maestri/cristalloterapia" className="block text-slate-300 hover:text-white py-1">
                    Cristalloterapia
                  </Link>
                  <Link href="/maestri/medianita" className="block text-slate-300 hover:text-white py-1">
                    Medianità
                  </Link>
                </div>
              </div>
              <div className="px-4">
                <div className="text-sky-300 font-medium mb-2">AstroMag</div>
                <div className="pl-4 space-y-2">
                  <Link href="/astromag/oroscopo" className="block text-slate-300 hover:text-white py-1">
                    Oroscopo
                  </Link>
                  <Link href="/astromag/tarocchi" className="block text-slate-300 hover:text-white py-1">
                    Tarocchi
                  </Link>
                  <Link href="/astromag/astrologia-blog" className="block text-slate-300 hover:text-white py-1">
                    Astrologia
                  </Link>
                  <Link href="/astromag/numerologia-blog" className="block text-slate-300 hover:text-white py-1">
                    Numerologia
                  </Link>
                  <Link href="/astromag/spiritualita" className="block text-slate-300 hover:text-white py-1">
                    Spiritualità
                  </Link>
                </div>
              </div>
              <div className="px-4 pt-4 border-t border-sky-500/20 space-y-2">
                <Link href="/login">
                  <Button variant="ghost" className="w-full text-sky-300 hover:text-white hover:bg-sky-900/20">
                    <LogIn className="h-4 w-4 mr-2" />
                    Accedi
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600">
                    <User className="h-4 w-4 mr-2" />
                    Registrati
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
