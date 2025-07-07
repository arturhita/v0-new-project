"use client"

import type React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"

export default function OperatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const operatorNavLinks = [
    { href: "/dashboard/operator", label: "Dashboard" },
    { href: "/dashboard/operator/availability", label: "Disponibilità" },
    { href: "/dashboard/operator/services", label: "Servizi" },
    { href: "/dashboard/operator/earnings", label: "Guadagni" },
    { href: "/dashboard/operator/consultations-history", label: "Storico Consulti" },
    { href: "/dashboard/operator/platform-messages", label: "Messaggi" },
    { href: "/dashboard/operator/reviews", label: "Recensioni" },
  ]

  return (
    <ProtectedRoute allowedRoles={["operator"]}>
      <DashboardLayout navLinks={operatorNavLinks} title="Area Operatore">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
