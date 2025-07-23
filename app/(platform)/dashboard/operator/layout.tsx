import type { ReactNode } from "react"

// This layout simply passes its children through.
// All necessary providers are already in the root layout.
export default function OperatorDashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
