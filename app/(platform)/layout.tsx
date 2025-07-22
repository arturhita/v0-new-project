import type React from "react"
import { SiteNavbar } from "@/components/site-navbar" // CORREZIONE: Importazione nominativa
import SiteFooter from "@/components/site-footer"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-slate-900">
        <SiteNavbar />
        <main className="flex-grow pt-16">{children}</main>
        <SiteFooter />
        <Toaster richColors theme="dark" position="bottom-right" />
      </div>
    </AuthProvider>
  )
}
