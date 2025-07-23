import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { ConstellationBackground } from "@/components/constellation-background"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ConstellationBackground />
      <SiteNavbar />
      <main className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </>
  )
}
