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
  description: "Piattaforma di consulenza al minuto",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <AuthProvider>
          <OperatorStatusProvider>
            <ChatRequestProvider>
              {children}
              <Toaster />
              <CookieBanner />
            </ChatRequestProvider>
          </OperatorStatusProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
