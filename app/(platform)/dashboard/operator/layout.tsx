import { ChatRequestProvider } from "@/contexts/chat-request-context"
import type React from "react"

export default function OperatorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ChatRequestProvider>{children}</ChatRequestProvider>
}
