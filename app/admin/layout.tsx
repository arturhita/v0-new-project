import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import Link from "next/link"
import {
  LayoutDashboard,
  Sparkles,
  CheckCircle,
  Users,
  Moon,
  Target,
  Wallet,
  Scroll,
  BarChart2,
  MessageSquareWarning,
  BookOpen,
  Send,
  LifeBuoy,
  Building,
  Settings,
  PlusCircle,
} from "lucide-react"

const adminNavItems = [
  { href: "/admin/dashboard", label: "Cruscotto", icon: LayoutDashboard },
  {
    label: "Operatori",
    icon: Sparkles,
    href: "#",
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
    icon: Wallet,
    href: "#",
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
    href: "#",
    subItems: [
      { href: "/admin/notifications", label: "Notifiche", icon: Send },
      { href: "/admin/tickets", label: "Ticket", icon: LifeBuoy },
    ],
  },
  {
    label: "Configurazione",
    icon: Settings,
    href: "#",
    subItems: [
      { href: "/admin/company-details", label: "Dati Aziendali", icon: Building },
      { href: "/admin/settings", label: "Impostazioni", icon: Settings },
      { href: "/admin/settings/advanced", label: "Impostazioni Avanzate", icon: Settings },
    ],
  },
]

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
    redirect("/")
  }

  const sidebarHeader = (
    <Link href="/admin" className="flex items-center gap-3 font-bold text-white text-xl">
      <span>Admin Panel</span>
    </Link>
  )

  const linkClasses = {
    base: "text-gray-600 hover:bg-blue-100 hover:text-blue-700",
    active: "bg-blue-600 text-white shadow-md scale-[1.02] font-semibold",
    inactive: "",
    icon: "text-gray-400 group-hover:text-blue-600",
    iconActive: "text-white",
  }

  return (
    <DashboardLayout
      menuItems={adminNavItems}
      sidebarHeader={sidebarHeader}
      sidebarHeaderClasses="bg-gradient-to-br from-blue-600 to-blue-700 border-gray-200"
      sidebarLinkClasses={linkClasses}
    >
      {children}
    </DashboardLayout>
  )
}
