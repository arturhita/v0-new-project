"use client"

import Link from "next/link"
import {
  Bell,
  Users,
  BarChart2,
  LifeBuoy,
  ChevronDown,
  Settings,
  Home,
  FileText,
  CreditCard,
  MessageSquare,
  Banknote,
  Mail,
  Trophy,
  Gift,
} from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import AdminLayoutClient from "./AdminLayoutClient"

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Utenti" },
  { href: "/admin/operators", icon: Users, label: "Operatori" },
  { href: "/admin/operator-approvals", icon: FileText, label: "Approvazioni Operatori" },
  { href: "/admin/reviews", icon: FileText, label: "Recensioni" },
  { href: "/admin/invoices", icon: CreditCard, label: "Fatture" },
  { href: "/admin/payouts", icon: Banknote, label: "Pagamenti" },
  { href: "/admin/promotions", icon: Gift, label: "Promozioni" },
  { href: "/admin/commission-requests-log", icon: MessageSquare, label: "Log Commissioni" },
  { href: "/admin/blog-management", icon: FileText, label: "Gestione Blog" },
  { href: "/admin/tickets", icon: LifeBuoy, label: "Ticket Supporto" },
  { href: "/admin/notifications", icon: Bell, label: "Notifiche di Sistema" },
  { href: "/admin/email-center", icon: Mail, label: "Email Center" },
  { href: "/admin/gamification", icon: Trophy, label: "Gamification" },
  { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Impostazioni",
    subItems: [
      { href: "/admin/settings/general", label: "Generali" },
      { href: "/admin/settings/legal", label: "Legale" },
      { href: "/admin/settings/advanced", label: "Avanzate" },
    ],
  },
]

const NavItem = ({
  item,
  pathname,
}: {
  item: (typeof navItems)[0] | (typeof navItems)[0]["subItems"][0]
  pathname: string
}) => {
  const isActive = item.href
    ? pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
    : false

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium text-gray-600 transition-colors duration-200 ease-in-out group",
        "hover:bg-blue-100 hover:text-blue-700",
        isActive && "bg-blue-600 text-white shadow-md scale-[1.02] font-semibold",
      )}
    >
      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
      {item.label}
    </Link>
  )
}

const CollapsibleNavItem = ({
  item,
  pathname,
}: {
  item: Extract<(typeof navItems)[number], { subItems: any }>
  pathname: string
}) => {
  const [isOpen, setIsOpen] = React.useState(item.subItems.some((sub) => pathname.startsWith(sub.href)))

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-3.5 rounded-lg px-4 py-3 text-base font-medium text-gray-600 transition-colors duration-200 ease-in-out",
          "hover:bg-blue-100 hover:text-blue-700",
        )}
      >
        <div className="flex items-center gap-3.5">
          <item.icon className="h-5 w-5 text-gray-400" />
          {item.label}
        </div>
        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-200 pl-3.5">
          {item.subItems.map((subItem) => (
            <NavItem key={subItem.label} item={subItem} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    // If not an admin, redirect them away.
    // You can decide where to send them, e.g., their own dashboard or login.
    redirect("/login")
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
