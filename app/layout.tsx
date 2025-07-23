import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/server"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenza Mistica",
  description: "La tua guida nel mondo della consulenza mistica e spirituale.",
    generator: 'v0.dev'
}

// Il Root Layout è ora un Server Component asincrono
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 1. Crea un client Supabase per il server.
  const supabase = createClient()

  // 2. Recupera la sessione utente corrente dal cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    // 3. Se l'utente è loggato, recupera il suo profilo dal database.
    const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = userProfile
  }

  return (
    <html lang="it">
      <body className={inter.className}>
        {/* 
          4. Inizializza l'AuthProvider con i dati utente e profilo recuperati sul server.
             Questo "idrata" il contesto client con lo stato corretto fin dal primo rendering,
             garantendo che il login sia mantenuto e non ci siano sfarfallii.
        */}
        <AuthProvider user={user} profile={profile}>
          {children}
        </AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
