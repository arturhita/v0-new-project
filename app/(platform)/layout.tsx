import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer" // Corretto: import di default

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white">
      <SiteNavbar />
      <main className="flex-grow">{children}</main>
      <SiteFooter />
    </div>
  )
}
