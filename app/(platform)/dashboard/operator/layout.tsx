import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Props {
  children: React.ReactNode
}

export default function OperatorDashboardLayout({ children }: Props) {
  return <DashboardLayout userType="operator">{children}</DashboardLayout>
}
