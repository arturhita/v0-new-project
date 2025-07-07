"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Wallet,
  FileText,
  Settings,
  HandCoins,
  BookUser,
  MessageSquare,
  Star,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/operator/profile", label: "Profilo", icon: User },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: Wallet },
  { href: "/dashboard/operator/invoices", label: "Fatture", icon: FileText },
  { href: "/dashboard/operator/payout-settings", label: "Impostazioni Pagamento", icon: Settings },
  { href: "/dashboard/operator/commission-request", label: "Richiesta Commissioni", icon: HandCoins },
  { href: "/dashboard/operator/tax-info", label: "Dati Fiscali", icon: BookUser },
  { href: "/dashboard/operator/internal-messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: Star },
]

export default function OperatorNavClient() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const NavLinks = () => (
    <nav className="flex flex-col gap-2 px-4 py-6">
      {navItems.map((item) => {
        const fullPath = `/platform${item.href}`
        const isActive = pathname === fullPath
        return (
          <Link
            key={item.href}
            href={fullPath}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200 hover:text-gray-900",
              isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200 hover:text-gray-900 justify-start mt-4"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </nav>
  )

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 sm:hidden">
        <Link href="/platform/dashboard/operator" className="text-lg font-bold text-primary">
          Moonthir
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-white sm:hidden">
          <NavLinks />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="text-lg font-bold text-primary">
            Moonthir Operatore
          </Link>
        </div>
        <div className="flex-1 overflow-auto">
          <NavLinks />
        </div>
      </aside>
    </>
  )
}
