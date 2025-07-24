import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { CookieBanner } from "@/components/cookie-banner"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenti del benessere",
  description: "Trova i migliori esperti di cartomanzia, astrologia e benessere per una consulenza personalizzata.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-900`}>
        {/* L'UNICO AuthProvider deve essere qui, al livello più alto */}
        <AuthProvider>
          <OperatorStatusProvider>
            <ChatRequestProvider>
              {children}
              <Toaster />
              <CookieBanner />
            </ChatRequestProvider>
          </OperatorStatusProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
