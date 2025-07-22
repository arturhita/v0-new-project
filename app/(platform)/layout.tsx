import { SiteFooter } from "@/components/site-footer"
import { SiteNavbar } from "@/components/site-navbar"
import type React from "react"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B112B] text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,60,152,0.3),rgba(255,255,255,0))]"></div>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteNavbar />
        <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
