import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"
import { createClient } from "@/lib/supabase/server"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenti del benessere",
  description: "Trova i migliori esperti di cartomanzia, astrologia e benessere per una consulenza personalizzata.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider session={session}>
          <OperatorStatusProvider>
            <ChatRequestProvider>
              {children}
              <Toaster position="top-center" richColors />
            </ChatRequestProvider>
          </OperatorStatusProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
