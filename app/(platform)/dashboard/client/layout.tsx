import type React from "react"
import { ClientSidebar } from "./_components/client-sidebar"
import { ProtectedRoute } from "@/components/protected-route"

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <div className="flex min-h-screen">
        <ClientSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
