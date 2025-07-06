import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/server"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Piattaforma di Consulenza",
  description: "La tua piattaforma di consulenza online.",
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

  const user = session?.user

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider user={user}>{children}</AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
