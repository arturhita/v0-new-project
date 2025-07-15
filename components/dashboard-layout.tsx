import type React from "react"
import {
  BarChart3,
  LayoutDashboard,
  ListChecks,
  Percent,
  Settings,
  FileText,
  Users,
  ShoppingBag,
  Mail,
  Target,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: any
}

export const adminNavItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Prodotti",
    icon: ShoppingBag,
  },
  {
    href: "/admin/orders",
    label: "Ordini",
    icon: ListChecks,
  },
  {
    href: "/admin/users",
    label: "Utenti",
    icon: Users,
  },
  {
    href: "/admin/promotions",
    label: "Promozioni",
    icon: Target,
  },
  {
    href: "/admin/commission-requests",
    label: "Richieste Commissioni",
    icon: Percent,
  },
  {
    href: "/admin/commission-requests-log",
    label: "Richieste Commissioni",
    icon: FileText,
  },
  {
    href: "/admin/analytics",
    label: "Analytics e Report",
    icon: BarChart3,
  },
  {
    href: "/admin/settings",
    label: "Impostazioni",
    icon: Settings,
  },
  {
    href: "/admin/settings/legal",
    label: "Testi Legali",
    icon: FileText,
  },
  {
    href: "/admin/contact-messages",
    label: "Messaggi Contatto",
    icon: Mail,
  },
]

export const userNavItems: NavItem[] = [
  {
    href: "/profile",
    label: "Profilo",
    icon: Users,
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  userType: "admin" | "user" | "operator"
  title?: string
}

export function DashboardLayout({ children, userType, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {title && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}
