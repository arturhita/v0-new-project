import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { ConstellationBackground } from "@/components/constellation-background"

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ConstellationBackground />
      <SiteNavbar />
      <main className="flex-grow pt-16 relative z-10">{children}</main>
      <SiteFooter />
    </div>
  )
}
