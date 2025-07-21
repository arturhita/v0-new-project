import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner" // Corretto: importato da "sonner"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import CookieBanner from "@/components/CookieBanner" // Added import for CookieBanner

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
        <AuthProvider>
          <OperatorStatusProvider>
            <ChatRequestProvider>
              {children}
              <Toaster richColors position="top-center" />
              <CookieBanner />
            </ChatRequestProvider>
          </OperatorStatusProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
