"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CalendarClock,
  Sparkles,
  Coins,
  FileText,
  Briefcase,
  MessageSquareHeart,
  BookUser,
  Settings,
  Percent,
  MailQuestion,
  Scroll,
  ShieldCheck,
  MessageSquare,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

const navItems = [
  { href: "/dashboard/operator", label: "Santuario Personale", icon: LayoutDashboard },
  { href: "/dashboard/operator/availability", label: "Orari Arcani", icon: CalendarClock },
  { href: "/dashboard/operator/services", label: "Modalità Consulto", icon: Sparkles },
  { href: "/dashboard/operator/earnings", label: "Tesoro Astrale", icon: Coins },
  { href: "/dashboard/operator/payouts", label: "Richieste Compensi", icon: FileText },
  { href: "/dashboard/operator/invoices", label: "Fatture Cosmiche", icon: Scroll },
  { href: "/dashboard/operator/tax-info", label: "Dati Fiscali Segreti", icon: ShieldCheck },
  { href: "/dashboard/operator/consultations-history", label: "Archivio Consulti", icon: Briefcase },
  { href: "/dashboard/operator/written-consultations", label: "Consulti Epistolari", icon: MailQuestion },
  { href: "/dashboard/operator/internal-messages", label: "Messaggi dal Tempio", icon: MessageSquareHeart },
  { href: "/dashboard/operator/platform-messages", label: "Messaggi dalla Piattaforma", icon: MessageSquare },
  { href: "/dashboard/operator/client-notes", label: "Appunti sui Cercatori", icon: BookUser },
  { href: "/dashboard/operator/commission-request", label: "Richiesta Decima", icon: Percent },
  { href: "/profile/operator", label: "Il Mio Altare (Profilo)", icon: Settings },
]

export function OperatorSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside className="hidden w-64 flex-col border-r bg-blue-800 text-white md:flex">
      <div className="flex h-20 items-center justify-center border-b border-blue-700 px-6 bg-gradient-to-br from-blue-800 to-blue-900">
        <Link href="/dashboard/operator" className="flex items-center gap-2.5 font-bold text-white text-lg">
          <span>Dashboard Operatore</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 overflow-auto py-5 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
              "hover:bg-blue-700 hover:text-white",
              pathname.startsWith(item.href) && item.href !== "/dashboard/operator"
                ? "bg-blue-600 text-white shadow-md font-semibold"
                : "",
              pathname === item.href ? "bg-blue-600 text-white shadow-md font-semibold" : "",
              !pathname.startsWith(item.href) && "text-blue-200",
            )}
          >
            <item.icon className={cn("h-5 w-5", pathname.startsWith(item.href) ? "text-white" : "text-blue-300")} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-3 border-t border-blue-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-base font-medium text-blue-200 hover:text-white hover:bg-blue-700"
          onClick={logout}
        >
          <LogOut className="mr-2.5 h-5 w-5" />
          Disconnetti
        </Button>
      </div>
    </aside>
  )
}
