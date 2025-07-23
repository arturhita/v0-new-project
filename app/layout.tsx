import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-provider"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import { Toaster } from "@/components/ui/sonner"
import { CookieBanner } from "@/components/cookie-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenti Esperti al Tuo Servizio",
  description:
    "Trova i migliori consulenti e cartomanti per una consulenza immediata e personalizzata. Chatta o parla con i nostri esperti.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} bg-[#0F172A] text-slate-100`}>
        <AuthProvider>
          <OperatorStatusProvider>
            <ChatRequestProvider>
              {children}
              <Toaster richColors position="top-right" />
              <CookieBanner />
            </ChatRequestProvider>
          </OperatorStatusProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
