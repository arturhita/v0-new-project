import type { ReactNode } from "react"

interface OperatorDashboardLayoutProps {
  children: ReactNode
}

export default function OperatorDashboardLayout({ children }: OperatorDashboardLayoutProps) {
  return <>{children}</>
}
