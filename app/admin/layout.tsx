import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function AdminAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout userType="admin">{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
