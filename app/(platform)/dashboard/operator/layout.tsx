"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Moon,
  Sun,
  Coffee,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"
import { useEffect } from "react"
import { OperatorStatusProvider, useOperatorStatus } from "@/contexts/operator-status-context"
import { ChatRequestProvider, useChatRequest } from "@/contexts/chat-request-context"
import { IncomingChatRequestModal } from "@/components/incoming-chat-request-modal"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { OperatorSidebar } from "./_components/operator-sidebar"

const navItemsOperator = [
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

const NavItemOperator = ({ item, pathname }: { item: (typeof navItemsOperator)[0]; pathname: string }) => {
  const isActive = pathname === item.href || (item.href !== "/dashboard/operator" && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3.5 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-in-out",
        "hover:bg-blue-700 hover:text-white",
        isActive && "bg-blue-600 text-white shadow-md font-semibold",
        !isActive && "text-blue-200",
      )}
    >
      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-blue-300")} />
      {item.label}
    </Link>
  )
}

function OperatorDashboardLayoutComponent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { status, setStatus, operatorName, pauseTimer } = useOperatorStatus()
  const { showRequest } = useChatRequest()
  const { logout } = useAuth()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("Simulazione: Ricevuta una richiesta di chat...")
      showRequest({
        sessionId: `session_sim_${Date.now()}`,
        fromUserId: "user_sim_123",
        fromUserName: "Mario Simulato",
      })
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [showRequest])

  const handleSetStatusManually = (newStatus: "online" | "offline" | "paused") => {
    setStatus(newStatus, true)
  }

  const getStatusIndicator = () => {
    switch (status) {
      case "online":
        return {
          icon: <Sun className="h-4 w-4 text-green-500" />,
          text: "Online",
          buttonClass: "border-green-300 text-green-700 hover:bg-green-50",
          dotClass: "bg-green-500",
        }
      case "offline":
        return {
          icon: <Moon className="h-4 w-4 text-gray-500" />,
          text: "Offline",
          buttonClass: "border-gray-300 text-gray-700 hover:bg-gray-50",
          dotClass: "bg-gray-500",
        }
      case "occupied":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          text: "Occupato",
          buttonClass: "border-red-300 text-red-700 hover:bg-red-50 animate-pulse",
          dotClass: "bg-red-500",
        }
      case "paused":
        return {
          icon: <Coffee className="h-4 w-4 text-amber-500" />,
          text: `In Pausa (${Math.floor(pauseTimer / 60)}:${(pauseTimer % 60).toString().padStart(2, "0")})`,
          buttonClass: "border-amber-300 text-amber-700 hover:bg-amber-50",
          dotClass: "bg-amber-500",
        }
      default:
        return {
          icon: <Moon className="h-4 w-4 text-gray-500" />,
          text: "Offline",
          buttonClass: "border-gray-300 text-gray-700 hover:bg-gray-50",
          dotClass: "bg-gray-500",
        }
    }
  }
  const currentStatusInfo = getStatusIndicator()

  const SidebarNavOperator = () => (
    <nav className="grid items-start gap-1.5 px-3">
      {navItemsOperator.map((item) => (
        <NavItemOperator key={item.label} item={item} pathname={pathname} />
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-screen">
      <OperatorSidebar />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-gray-50">
        {children}
        <IncomingChatRequestModal />
      </main>
    </div>
  )
}

export default function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["operator"]}>
      <OperatorStatusProvider>
        <ChatRequestProvider>
          <OperatorDashboardLayoutComponent>{children}</OperatorDashboardLayoutComponent>
        </ChatRequestProvider>
      </OperatorStatusProvider>
    </ProtectedRoute>
  )
}
