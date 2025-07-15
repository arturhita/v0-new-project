import { Home, Calendar, FileText, LineChart, CreditCard, Star, Mail, Briefcase, CircleUser } from "lucide-react"

export const operatorNavItems = [
  { href: "/dashboard/operator", label: "Dashboard", icon: Home },
  { href: "/dashboard/operator/availability", label: "Disponibilità", icon: Calendar },
  { href: "/dashboard/operator/consultations-history", label: "Consulti", icon: FileText },
  { href: "/dashboard/operator/earnings", label: "Guadagni", icon: LineChart },
  { href: "/dashboard/operator/payouts", label: "Pagamenti", icon: CreditCard },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: Star },
  { href: "/dashboard/operator/platform-messages", label: "Messaggi", icon: Mail },
  { href: "/dashboard/operator/services", label: "Servizi", icon: Briefcase },
  { href: "/profile/operator", label: "Profilo", icon: CircleUser },
]
