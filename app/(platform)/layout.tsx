import type React from "react"
import SiteNavbar from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import ConstellationBackground from "@/components/constellation-background"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ChatRequestProvider>
        <OperatorStatusProvider>
          {/* Aggiunto lo sfondo a livello di layout */}
          <ConstellationBackground />
          <div className="relative z-0 flex min-h-screen flex-col">
            <SiteNavbar />
            <main className="flex-grow">{children}</main>
            <SiteFooter />
          </div>
          <Toaster richColors position="top-right" />
        </OperatorStatusProvider>
      </ChatRequestProvider>
    </AuthProvider>
  )
}
