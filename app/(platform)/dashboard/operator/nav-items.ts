import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  DollarSign,
  Briefcase,
  Settings,
  Phone,
  Star,
} from "lucide-react"

export const operatorNavItems = [
  { href: "/dashboard/operator", icon: Home, label: "Dashboard" },
  { href: "/dashboard/operator/availability", icon: Calendar, label: "Disponibilità" },
  { href: "/dashboard/operator/consultations-history", icon: Briefcase, label: "Storico Consulenze" },
  { href: "/dashboard/operator/written-consultations", icon: FileText, label: "Consulti Scritti" },
  { href: "/dashboard/operator/calls", icon: Phone, label: "Chiamate" },
  { href: "/dashboard/operator/platform-messages", icon: MessageSquare, label: "Messaggi" },
  { href: "/dashboard/operator/client-notes", icon: Users, label: "Note Clienti" },
  { href: "/dashboard/operator/reviews", icon: Star, label: "Recensioni" },
  { href: "/dashboard/operator/earnings", icon: DollarSign, label: "Guadagni" },
  { href: "/dashboard/operator/payouts", icon: DollarSign, label: "Pagamenti" },
  { href: "/dashboard/operator/services", icon: Settings, label: "Servizi" },
  { href: "/dashboard/operator/tax-info", icon: FileText, label: "Dati Fiscali" },
]
