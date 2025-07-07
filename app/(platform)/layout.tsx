import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { ConstellationBackground } from "@/components/constellation-background"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <ConstellationBackground />
      <SiteNavbar />
      <main className="relative z-10">{children}</main>
      <SiteFooter />
    </div>
  )
}
