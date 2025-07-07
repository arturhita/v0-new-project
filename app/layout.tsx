import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import CookieBanner from "@/components/cookie-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir",
  description: "Consulenza al minuto con i migliori esperti",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <AuthProvider>
          <OperatorStatusProvider>
            <ChatRequestProvider>{children}</ChatRequestProvider>
          </OperatorStatusProvider>
        </AuthProvider>
        <Toaster />
        <CookieBanner />
      </body>
    </html>
  )
}
