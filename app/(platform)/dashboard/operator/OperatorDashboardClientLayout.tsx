"use client"

import type React from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
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
  ChevronDown,
} from "lucide-react"
import { OperatorStatusProvider, useOperatorStatus } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import { IncomingChatRequestModal } from "@/components/incoming-chat-request-modal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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

function OperatorStatusDropdown() {
  const { status, setStatus, pauseTimer } = useOperatorStatus()

  const handleSetStatusManually = (newStatus: "online" | "offline" | "paused") => {
    setStatus(newStatus, true)
  }

  const getStatusIndicator = () => {
    switch (status) {
      case "online":
        return {
          icon: Sun,
          text: "Online",
          buttonClass: "border-green-300 text-green-700 hover:bg-green-50",
          dotClass: "bg-green-500",
        }
      case "offline":
        return {
          icon: Moon,
          text: "Offline",
          buttonClass: "border-gray-300 text-gray-700 hover:bg-gray-50",
          dotClass: "bg-gray-500",
        }
      case "occupied":
        return {
          icon: AlertTriangle,
          text: "Occupato",
          buttonClass: "border-red-300 text-red-700 hover:bg-red-50 animate-pulse",
          dotClass: "bg-red-500",
        }
      case "paused":
        return {
          icon: Coffee,
          text: `In Pausa (${Math.floor(pauseTimer / 60)}:${(pauseTimer % 60).toString().padStart(2, "0")})`,
          buttonClass: "border-amber-300 text-amber-700 hover:bg-amber-50",
          dotClass: "bg-amber-500",
        }
      default:
        return {
          icon: Moon,
          text: "Offline",
          buttonClass: "border-gray-300 text-gray-700 hover:bg-gray-50",
          dotClass: "bg-gray-500",
        }
    }
  }
  const currentStatusInfo = getStatusIndicator()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border-2 bg-white",
            currentStatusInfo.buttonClass,
          )}
        >
          <span className={cn("h-2.5 w-2.5 rounded-full", currentStatusInfo.dotClass)} />
          <span className="font-medium">{currentStatusInfo.text}</span>
          <ChevronDown className="h-4 w-4 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
        <DropdownMenuLabel className="text-gray-700">Imposta il tuo stato</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem
          onClick={() => handleSetStatusManually("online")}
          disabled={status === "online"}
          className="text-gray-800 focus:bg-blue-100"
        >
          <Sun className="mr-2 h-4 w-4 text-green-500" />
          <span>Online</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSetStatusManually("paused")}
          disabled={status === "paused"}
          className="text-gray-800 focus:bg-blue-100"
        >
          <Coffee className="mr-2 h-4 w-4 text-amber-500" />
          <span>Pausa (20 min)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSetStatusManually("offline")}
          disabled={status === "offline"}
          className="text-gray-800 focus:bg-blue-100"
        >
          <Moon className="mr-2 h-4 w-4 text-gray-500" />
          <span>Offline</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function OperatorDashboardClientLayout({ children }: { children: React.ReactNode }) {
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
