import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { OperatorDashboardLayoutContent } from "./_components/operator-dashboard-layout"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["operator"]}>
      <OperatorStatusProvider>
        <ChatRequestProvider>
          <OperatorDashboardLayoutContent>{children}</OperatorDashboardLayoutContent>
        </ChatRequestProvider>
      </OperatorStatusProvider>
    </ProtectedRoute>
  )
}
