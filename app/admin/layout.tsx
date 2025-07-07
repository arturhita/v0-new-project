"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  BarChart2,
  Settings,
  Gift,
  MessageSquare,
  LifeBuoy,
  BookOpen,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Gestione Utenti", icon: Users },
  { href: "/admin/operators", label: "Gestione Operatori", icon: UserCheck },
  { href: "/admin/operator-approvals", label: "Approvazioni", icon: FileText },
  { href: "/admin/reviews", label: "Moderazione Recensioni", icon: BookOpen },
  { href: "/admin/payouts", label: "Gestione Pagamenti", icon: CreditCard },
  { href: "/admin/promotions", label: "Promozioni", icon: Gift },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/tickets", label: "Ticket Supporto", icon: LifeBuoy },
  { href: "/admin/blog-management", label: "Blog", icon: MessageSquare },
  { href: "/admin/settings", label: "Impostazioni", icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { profile, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Accesso Negato</h1>
          <p className="mt-2 text-gray-400">Non disponi delle autorizzazioni per visualizzare questa pagina.</p>
          <Link href="/" className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white">
            Torna alla Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-900 text-gray-200">
      <aside className="sticky top-0 h-screen w-64 flex-col border-r border-gray-800 bg-gray-950 p-4 hidden md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold">A</div>
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white",
                pathname.startsWith(item.href) && "bg-gray-800 text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
