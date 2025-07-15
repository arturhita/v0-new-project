import type { ReactNode } from "react"
import AdminLayoutClient from "./AdminLayoutClient"

// This layout is now protected SOLELY by the middleware.
// It no longer needs to perform its own auth checks.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
