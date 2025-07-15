import type React from "react"
import SiteNavbar from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
    </div>
  )
}
