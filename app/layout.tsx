import type React from "react"
import "./globals.css"
import { Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { AuthProvider } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database" // Assumendo che tu abbia un file di tipi

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    // Recupera il profilo solo se l'utente esiste
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = profileData
  }

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <AuthProvider user={user} profile={profile}>
          <div className="relative flex min-h-screen flex-col">
            <SiteNavbar />
            <main className="flex-grow">{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
