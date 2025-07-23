import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { SiteNavbar } from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database"
import { Toaster } from "sonner"
import { CookieBanner } from "@/components/cookie-banner"
import type { Metadata } from "next"
import SupabaseListener from "@/lib/supabase/listener"

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
    data: { session },
  } = await supabase.auth.getSession()

  let profile: Profile | null = null
  if (session?.user) {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
    profile = profileData
  }

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-gray-900 text-gray-200 font-sans antialiased", inter.className)}>
        {/* Il listener è fondamentale per mantenere la sessione client aggiornata */}
        <SupabaseListener serverAccessToken={session?.access_token} />

        <div className="relative flex min-h-screen flex-col">
          {/* Passiamo i dati utente direttamente alla navbar */}
          <SiteNavbar user={session?.user ?? null} profile={profile} />
          <main className="flex-grow pt-16">{children}</main>
          <SiteFooter />
        </div>
        <CookieBanner />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
