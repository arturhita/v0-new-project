"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-provider"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import { ClientConsultationProvider } from "@/contexts/client-consultation-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OperatorStatusProvider>
        <ChatRequestProvider>
          <ClientConsultationProvider>{children}</ClientConsultationProvider>
        </ChatRequestProvider>
      </OperatorStatusProvider>
    </AuthProvider>
  )
}
