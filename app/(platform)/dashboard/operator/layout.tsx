import type React from "react"
// CORREZIONE: Corretto il percorso di importazione e il tipo di import (da default a named)
import { DashboardLayout } from "@/components/dashboard-layout"

interface Props {
  children: React.ReactNode
}

export default function OperatorDashboardLayout({ children }: Props) {
  // CORREZIONE: Corretta la prop da "userRole" a "userType"
  return <DashboardLayout userType="operator">{children}</DashboardLayout>
}
