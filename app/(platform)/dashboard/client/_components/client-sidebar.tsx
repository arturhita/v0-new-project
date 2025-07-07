"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Wallet, MessageSquare, Star, Phone, FileText, LifeBuoy, Settings } from "lucide-react"

const navItems = [
  { href: "/dashboard/client", icon: Home, label: "Dashboard" },
  { href: "/dashboard/client/wallet", icon: Wallet, label: "Il Mio Credito" },
  { href: "/dashboard/client/consultations", icon: Phone, label: "Consulti" },
  { href: "/dashboard/client/written-consultations", icon: FileText, label: "Consulti Scritti" },
  { href: "/dashboard/client/messages", icon: MessageSquare, label: "Messaggi" },
  { href: "/dashboard/client/reviews", icon: Star, label: "Le Mie Recensioni" },
  { href: "/dashboard/client/support", icon: LifeBuoy, label: "Supporto" },
  { href: "/profile", icon: Settings, label: "Impostazioni Profilo" },
]

export default function ClientSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col gap-2 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Area Cliente</h2>
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
