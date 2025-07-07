"use client"

import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import ClientSidebar from "./_components/client-sidebar"

function ClientDashboardLayoutComponent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <ClientSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <ClientDashboardLayoutComponent>{children}</ClientDashboardLayoutComponent>
    </ProtectedRoute>
  )
}
