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
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = userProfile
  }

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider user={user} profile={profile}>
          <main>{children}</main>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
