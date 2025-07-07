"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Briefcase,
  Calendar,
  Banknote,
  MessageSquare,
  FileText,
  Settings,
  BookUser,
  Percent,
  FileSignature,
  Voicemail,
} from "lucide-react"

const navItems = [
  { href: "/dashboard/operator", icon: Home, label: "Dashboard" },
  { href: "/dashboard/operator/services", icon: Briefcase, label: "Servizi" },
  { href: "/dashboard/operator/availability", icon: Calendar, label: "Disponibilità" },
  { href: "/dashboard/operator/earnings", icon: Banknote, label: "Guadagni" },
  { href: "/dashboard/operator/payouts", icon: Banknote, label: "Pagamenti Ricevuti" },
  { href: "/dashboard/operator/consultations-history", icon: Voicemail, label: "Storico Consulti" },
  { href: "/dashboard/operator/written-consultations", icon: FileSignature, label: "Consulti Scritti" },
  { href: "/dashboard/operator/platform-messages", icon: MessageSquare, label: "Messaggi" },
  { href: "/dashboard/operator/client-notes", icon: BookUser, label: "Note Clienti" },
  { href: "/dashboard/operator/commission-request", icon: Percent, label: "Richiesta Commissioni" },
  { href: "/dashboard/operator/tax-info", icon: FileText, label: "Dati Fiscali" },
  { href: "/profile/operator", icon: Settings, label: "Impostazioni Profilo" },
]

export default function OperatorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col gap-2 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Area Esperto</h2>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-muted text-primary",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
