import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    // Questo layout NON deve avere un suo AuthProvider.
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-grow pt-16">{children}</main>
      <SiteFooter />
    </div>
  )
}
