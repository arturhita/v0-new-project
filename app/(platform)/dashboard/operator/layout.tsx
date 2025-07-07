import type React from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"

interface Props {
  children: React.ReactNode
}

export default function OperatorDashboardLayout({ children }: Props) {
  return <DashboardLayout userRole="operator">{children}</DashboardLayout>
}
