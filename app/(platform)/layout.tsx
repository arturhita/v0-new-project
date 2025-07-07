import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // CORREZIONE: Rimosso bg-white per permettere alle pagine di definire il proprio sfondo
    <div className="flex flex-col min-h-screen">
      <SiteNavbar />
      {/* CORREZIONE: Rimosso pt-16 per eliminare la barra bianca */}
      <main className="flex-grow">{children}</main>
      <SiteFooter />
    </div>
  )
}
