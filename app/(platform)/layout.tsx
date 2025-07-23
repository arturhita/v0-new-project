import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { CookieBanner } from "@/components/cookie-banner"

// Questo layout definisce la UI comune per tutte le pagine della piattaforma.
// Viene applicato a rotte come la homepage, le dashboard, ecc.
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNavbar />
      <main className="flex-grow flex flex-col pt-16">{children}</main>
      <SiteFooter />
      <CookieBanner />
    </div>
  )
}
