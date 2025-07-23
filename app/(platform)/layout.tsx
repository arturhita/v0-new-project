import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import SiteFooter from "@/components/site-footer"
import SiteNavbar from "@/components/site-navbar"
import { ConstellationBackground } from "@/components/constellation-background"
import { Toaster } from "@/components/ui/toaster"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen flex-col bg-slate-900 text-slate-50">
        <ConstellationBackground />
        <SiteNavbar />
        <main className="relative z-10 flex-grow">{children}</main>
        <SiteFooter />
        <Toaster />
      </div>
    </AuthProvider>
  )
}
