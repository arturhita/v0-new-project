"use client"

import Link from "next/link"
import { Home, Wallet, MessageSquare, Star, LifeBuoy, Briefcase, Mail, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import ClientSidebar from "./_components/client-sidebar"

const navItemsClient = [
  { href: "/dashboard/client", label: "Panoramica", icon: Home },
  { href: "/dashboard/client/wallet", label: "Il Mio Wallet", icon: Wallet },
  { href: "/dashboard/client/consultations", label: "Storico Consulenze", icon: Briefcase },
  { href: "/dashboard/client/written-consultations", label: "Consulti Scritti", icon: Mail },
  { href: "/dashboard/client/messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/client/reviews", label: "Le Mie Recensioni", icon: Star },
  { href: "/dashboard/client/support", label: "Supporto", icon: LifeBuoy },
  { href: "/profile", label: "Il Mio Profilo", icon: UserCircle },
]

const NavItemClient = ({ item, pathname }: { item: (typeof navItemsClient)[0]; pathname: string }) => {
  const isActive = pathname === item.href || (item.href !== "/dashboard/client" && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
        "hover:bg-blue-100 hover:text-blue-700",
        isActive && "bg-blue-600 text-white shadow-md font-semibold",
        !isActive && "text-gray-700",
      )}
    >
      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
      {item.label}
    </Link>
  )
}

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="flex min-h-screen bg-muted/40">
        <ClientSidebar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
