import type React from "react"
import type { ReactNode } from "react"

interface DashboardClientLayoutProps {
  children: ReactNode
}

const DashboardClientLayout: React.FC<DashboardClientLayoutProps> = ({ children }) => {
  return <>{children}</>
}

export default DashboardClientLayout
