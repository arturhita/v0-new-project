import type { ReactNode } from "react"
import OperatorDashboardLayoutClient from "./OperatorDashboardLayoutClient"

// This layout is now protected SOLELY by the middleware.
export default function OperatorDashboardLayout({ children }: { children: ReactNode }) {
  return <OperatorDashboardLayoutClient>{children}</OperatorDashboardLayoutClient>
}
