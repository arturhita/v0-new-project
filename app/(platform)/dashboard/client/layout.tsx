"use client"

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import ClientDashboardLayoutClient from "./ClientDashboardLayoutClient"
import { LayoutDashboard, MessageSquare, Phone, Star, LifeBuoy, Wallet, FileText, History } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard/client", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/client/consultations", icon: History, label: "Consulti" },
  { href: "/dashboard/client/messages", icon: MessageSquare, label: "Messaggi" },
  { href: "/dashboard/client/calls", icon: Phone, label: "Chiamate" },
  { href: "/dashboard/client/written-consultations", icon: FileText, label: "Consulti Scritti" },
  { href: "/dashboard/client/reviews", icon: Star, label: "Recensioni" },
  { href: "/dashboard/client/wallet", icon: Wallet, label: "Portafoglio" },
  { href: "/dashboard/client/support", icon: LifeBuoy, label: "Supporto" },
]

const NavItemClient = ({ item, pathname }: { item: (typeof navItems)[0]; pathname: string }) => {
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

export default async function ClientDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Redirect if not a client
  if (profile?.role !== "client") {
    if (profile?.role === "admin") {
      redirect("/admin/dashboard")
    } else if (profile?.role === "operator") {
      redirect("/dashboard/operator")
    } else {
      // Fallback if role is somehow null
      redirect("/login")
    }
  }

  return <ClientDashboardLayoutClient>{children}</ClientDashboardLayoutClient>
}
