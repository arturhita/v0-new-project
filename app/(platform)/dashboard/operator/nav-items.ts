import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  BarChart2,
  CreditCard,
  Settings,
  Briefcase,
  Phone,
  Star,
} from "lucide-react"

export const operatorNavItems = [
  { href: "/dashboard/operator", label: "Dashboard", icon: Home },
  { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/dashboard/operator/consultations-history", label: "Storico Consulenze", icon: Briefcase },
  { href: "/dashboard/operator/written-consultations", label: "Consulti Scritti", icon: FileText },
  { href: "/dashboard/operator/calls", label: "Chiamate", icon: Phone },
  { href: "/dashboard/operator/platform-messages", label: "Messaggi", icon: MessageSquare },
  { href: "/dashboard/operator/client-notes", label: "Note Clienti", icon: Users },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: Star },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: BarChart2 },
  { href: "/dashboard/operator/payouts", label: "Pagamenti", icon: CreditCard },
  { href: "/dashboard/operator/services", label: "Servizi", icon: Settings },
  { href: "/dashboard/operator/tax-info", label: "Dati Fiscali", icon: FileText },
]
