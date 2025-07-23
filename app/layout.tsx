import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/server"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react" // CORREZIONE APPLICATA QUI
import "./globals.css"

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
    data: { user },
  } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = userProfile
  }

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-900`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider user={user} profile={profile}>
            {children}
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
