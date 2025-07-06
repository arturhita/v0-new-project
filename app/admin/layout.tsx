import type React from "react"
import Link from "next/link"
import {
  Home,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Star,
  FileText,
  UserCircle,
  LogOut,
  UserCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/operators", label: "Operatori", icon: Briefcase },
  { href: "/admin/operator-approvals", label: "Approvazioni", icon: UserCheck, badge: 3 },
  { href: "/admin/reviews", label: "Recensioni", icon: Star },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Impostazioni", icon: Settings },
  { href: "/admin/settings/legal", label: "Testi Legali", icon: FileText },
]

const accountItems = [{ href: "/admin/profile", label: "Il Mio Profilo", icon: UserCircle }]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-900 text-white">
      <div className="hidden border-r border-indigo-500/20 bg-slate-900/50 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-indigo-500/20 px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={24} height={24} />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                Moonthir Admin
              </span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <h3 className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Generale</h3>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-indigo-500/10"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/80">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
              <h3 className="px-2 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</h3>
              {accountItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-indigo-500/10"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Link
                href="/logout" // Assicurati che questo punti alla tua server action di logout
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-all hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
          {children}
        </main>
      </div>
    </div>
  )
}
