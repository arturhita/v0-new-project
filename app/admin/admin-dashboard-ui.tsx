"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Wallet,
  BookOpen,
  BarChart2,
  MessageSquareWarning,
  Send,
  LifeBuoy,
  Sparkles,
  CheckCircle,
  ChevronDown,
  Moon,
  Scroll,
  Coins,
  Building,
  Settings,
  PlusCircle,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

const navItems = [
  { href: "/admin", label: "Cruscotto", icon: LayoutDashboard },
  {
    label: "Operatori",
    icon: Sparkles,
    subItems: [
      { href: "/admin/operator-approvals", label: "Approvazioni", icon: CheckCircle },
      { href: "/admin/operators", label: "Elenco Operatori", icon: Users },
      { href: "/admin/operators/create", label: "Crea Operatore", icon: PlusCircle },
    ],
  },
  { href: "/admin/users", label: "Utenti", icon: Moon },
  { href: "/admin/promotions", label: "Promozioni", icon: Target },
  {
    label: "Finanze",
    icon: Coins,
    subItems: [
      { href: "/admin/payouts", label: "Pagamenti", icon: Wallet },
      { href: "/admin/invoices", label: "Fatture", icon: Scroll },
    ],
  },
  { href: "/admin/analytics", label: "Statistiche", icon: BarChart2 },
  { href: "/admin/reviews", label: "Recensioni", icon: MessageSquareWarning },
  { href: "/admin/blog-management", label: "Gestione Blog", icon: BookOpen },
  {
    label: "Supporto",
    icon: Send,
    subItems: [
      { href: "/admin/notifications", label: "Notifiche", icon: Send },
      { href: "/admin/tickets", label: "Ticket", icon: LifeBuoy },
    ],
  },
  {
    label: "Configurazione",
    icon: Settings,
    subItems: [
      { href: "/admin/company-details", label: "Dati Aziendali", icon: Building },
      { href: "/admin/settings", label: "Impostazioni", icon: Settings },
      { href: "/admin/settings/advanced", label: "Impostazioni Avanzate", icon: Settings },
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

export default function AdminDashboardUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-72 border-r border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-blue-700">Admin Panel</h1>
        </div>
        <nav className="mt-8 space-y-2">
          {navItems.map((item) =>
            "subItems" in item ? (
              <CollapsibleNavItem key={item.label} item={item} pathname={pathname} />
            ) : (
              <NavItem key={item.label} item={item} pathname={pathname} />
            ),
          )}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
