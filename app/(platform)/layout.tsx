import type React from "react"
import SiteNavbar from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { Toaster } from "sonner" // CORREZIONE: Importato dalla libreria corretta

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <SiteNavbar />
      <main className="flex-grow">{children}</main>
      <SiteFooter />
      <Toaster richColors theme="dark" position="bottom-right" />
    </div>
  )
}
