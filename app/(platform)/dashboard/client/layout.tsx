"use client"

import type React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const clientNavLinks = [
    { href: "/dashboard/client", label: "Dashboard" },
    { href: "/dashboard/client/consultations", label: "I miei consulti" },
    { href: "/dashboard/client/messages", label: "Messaggi" },
    { href: "/dashboard/client/wallet", label: "Portafoglio" },
    { href: "/dashboard/client/reviews", label: "Le mie recensioni" },
    { href: "/dashboard/client/support", label: "Supporto" },
  ]

  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <DashboardLayout navLinks={clientNavLinks} title="Area Cliente">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
