import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import SiteNavbar from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { AuthProvider } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database"
import { Toaster } from "sonner"
import { CookieBanner } from "@/components/cookie-banner"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - La tua guida astrale",
  description:
    "Esplora il mondo dell'astrologia e della cartomanzia con i nostri esperti. Consulti personalizzati, oroscopo, tarocchi e molto altro.",
    generator: 'v0.dev'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = profileData
  }

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-gray-900 text-gray-200 font-sans antialiased", inter.className)}>
        <AuthProvider user={user} profile={profile}>
          <div className="relative flex min-h-screen flex-col">
            <SiteNavbar />
            <main className="flex-grow pt-16">{children}</main>
            <SiteFooter />
          </div>
          <CookieBanner />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
