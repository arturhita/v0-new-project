import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import DashboardLayout from "@/components/dashboard-layout"
import { IncomingChatRequestModal } from "@/components/incoming-chat-request-modal"
import Link from "next/link"
import {
  LayoutDashboard,
  CalendarClock,
  Sparkles,
  Coins,
  FileText,
  Briefcase,
  MessageSquareHeart,
  BookUser,
  Settings,
  Percent,
  MailQuestion,
  Scroll,
  ShieldCheck,
  MessageSquare,
} from "lucide-react"
import OperatorStatusDropdown from "./OperatorStatusDropdown" // Componente client separato

const operatorNavItems = [
  { href: "/dashboard/operator", label: "Santuario Personale", icon: LayoutDashboard },
  { href: "/dashboard/operator/availability", label: "Orari Arcani", icon: CalendarClock },
  { href: "/dashboard/operator/services", label: "Modalità Consulto", icon: Sparkles },
  { href: "/dashboard/operator/earnings", label: "Tesoro Astrale", icon: Coins },
  { href: "/dashboard/operator/payouts", label: "Richieste Compensi", icon: FileText },
  { href: "/dashboard/operator/invoices", label: "Fatture Cosmiche", icon: Scroll },
  { href: "/dashboard/operator/tax-info", label: "Dati Fiscali Segreti", icon: ShieldCheck },
  { href: "/dashboard/operator/consultations-history", label: "Archivio Consulti", icon: Briefcase },
  { href: "/dashboard/operator/written-consultations", label: "Consulti Epistolari", icon: MailQuestion },
  { href: "/dashboard/operator/internal-messages", label: "Messaggi dal Tempio", icon: MessageSquareHeart },
  { href: "/dashboard/operator/platform-messages", label: "Messaggi dalla Piattaforma", icon: MessageSquare },
  { href: "/dashboard/operator/client-notes", label: "Appunti sui Cercatori", icon: BookUser },
  { href: "/dashboard/operator/commission-request", label: "Richiesta Decima", icon: Percent },
  { href: "/profile/operator", label: "Il Mio Altare (Profilo)", icon: Settings },
]

const sidebarHeader = (
  <Link href="/dashboard/operator" className="flex items-center gap-2.5 font-bold text-white text-lg">
    <span>Dashboard Operatore</span>
  </Link>
)

const linkClasses = {
  base: "text-blue-200 hover:bg-blue-700 hover:text-white",
  active: "bg-blue-600 text-white shadow-md font-semibold",
  inactive: "",
  icon: "text-blue-300",
  iconActive: "text-white",
}

export default async function OperatorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "operator") {
    // Se l'utente è loggato ma non è un operatore, reindirizzalo alla sua dashboard o alla home
    redirect(profile?.role === "client" ? "/dashboard/client" : "/")
  }

  return (
    <OperatorStatusProvider>
      <ChatRequestProvider>
        <DashboardLayout
          menuItems={operatorNavItems}
          sidebarHeader={sidebarHeader}
          headerContent={<OperatorStatusDropdown />}
          sidebarBaseClasses="border-blue-700 bg-blue-800"
          sidebarHeaderClasses="bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700"
          sidebarLinkClasses={linkClasses}
        >
          {children}
          <IncomingChatRequestModal />
        </DashboardLayout>
      </ChatRequestProvider>
    </OperatorStatusProvider>
  )
}
