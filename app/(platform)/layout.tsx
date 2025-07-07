import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SiteNavbar />
      <main className="flex-grow pt-16">{children}</main>
      <SiteFooter />
    </div>
  )
}
