import type React from "react"
import SiteNavbar from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer" // Corretto: importazione di default
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ChatRequestProvider>
        <OperatorStatusProvider>
          <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
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
