import type React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminNavLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Utenti" },
    { href: "/admin/operators", label: "Operatori" },
    { href: "/admin/operator-approvals", label: "Approvazioni" },
    { href: "/admin/invoices", label: "Fatture" },
    { href: "/admin/payouts", label: "Pagamenti" },
    { href: "/admin/reviews", label: "Recensioni" },
    { href: "/admin/tickets", label: "Ticket Supporto" },
    { href: "/admin/promotions", label: "Promozioni" },
    { href: "/admin/blog-management", label: "Blog" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/settings", label: "Impostazioni" },
  ]

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout navLinks={adminNavLinks} title="Pannello Amministrazione">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
