import type React from "react"
import Link from "next/link"
import { Home, MessageSquare, Briefcase, Star, LifeBuoy, Wallet, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const navItems = [
  { href: "/dashboard/client", icon: Home, label: "Dashboard" },
  { href: "/dashboard/client/messages", icon: MessageSquare, label: "Messaggi" },
  { href: "/dashboard/client/consultations", icon: Briefcase, label: "Consulti" },
  { href: "/dashboard/client/reviews", icon: Star, label: "Recensioni" },
  { href: "/dashboard/client/wallet", icon: Wallet, label: "Wallet" },
  { href: "/dashboard/client/profile", icon: User, label: "Profilo" },
  { href: "/dashboard/client/support", icon: LifeBuoy, label: "Supporto" },
]

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Se l'utente non ha un profilo o non è un cliente, lo mandiamo al login.
  // Questo previene che un operatore acceda alla dashboard cliente.
  if (!profile || profile.role !== "client") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 flex-shrink-0 bg-white border-r">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">Area Cliente</h2>
        </div>
        <nav className="mt-4 px-2">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  )
}
