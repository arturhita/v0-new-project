"use client"

import Link from "next/link"
import AdminSidebar from "@/components/admin-sidebar"
import React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Cruscotto" },
  {
    label: "Operatori",
    subItems: [
      { href: "/admin/operator-approvals", label: "Approvazioni" },
      { href: "/admin/operators", label: "Elenco Operatori" },
      { href: "/admin/operators/create", label: "Crea Operatore" },
    ],
  },
  { href: "/admin/users", label: "Utenti" },
  { href: "/admin/promotions", label: "Promozioni" },
  {
    label: "Finanze",
    subItems: [
      { href: "/admin/payouts", label: "Pagamenti" },
      { href: "/admin/invoices", label: "Fatture" },
    ],
  },
  { href: "/admin/analytics", label: "Statistiche" },
  { href: "/admin/reviews", label: "Recensioni" },
  { href: "/admin/blog-management", label: "Gestione Blog" },
  {
    label: "Supporto",
    subItems: [
      { href: "/admin/notifications", label: "Notifiche" },
      { href: "/admin/tickets", label: "Ticket" },
    ],
  },
  {
    label: "Configurazione",
    subItems: [
      { href: "/admin/company-details", label: "Dati Aziendali" },
      { href: "/admin/settings", label: "Impostazioni" },
      { href: "/admin/settings/advanced", label: "Impostazioni Avanzate" },
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
        <div className="flex items-center gap-3.5">{item.label}</div>
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
