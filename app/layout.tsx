import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database.types"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenza Mistica",
  description: "La tua guida nel mondo della cartomanzia e astrologia.",
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
    <html lang="it">
      <body className={inter.className}>
        <AuthProvider serverSession={session} serverProfile={profile}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
