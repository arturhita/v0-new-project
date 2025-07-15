import type { ReactNode } from "react"
import ClientDashboardLayoutClient from "./ClientDashboardLayoutClient"

// This layout is now protected SOLELY by the middleware.
export default function ClientDashboardLayout({ children }: { children: ReactNode }) {
  return <ClientDashboardLayoutClient>{children}</ClientDashboardLayoutClient>
}
