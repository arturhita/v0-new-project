import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"
import { CookieBanner } from "@/components/cookie-banner"
import { OperatorStatusProvider } from "@/contexts/operator-status-context"
import { ChatRequestProvider } from "@/contexts/chat-request-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenti del benessere",
  description: "Trova i migliori esperti di cartomanzia, astrologia e benessere per una consulenza personalizzata.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Leggiamo le variabili d'ambiente qui, sul server, in modo sicuro e flessibile.
  // Cerchiamo sia il nome con prefisso NEXT_PUBLIC_ che quello senza.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // Se le variabili non sono impostate, l'app si fermerà qui con un errore chiaro.
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set. Please check your Vercel project settings.")
  }

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Passiamo le chiavi come props al nostro provider */}
        <AuthProvider supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey}>
          <OperatorStatusProvider>
            <ChatRequestProvider>
              <div className="flex flex-col min-h-screen">
                <SiteNavbar />
                <main className="flex-grow pt-16">{children}</main>
                <SiteFooter />
                <Toaster />
                <CookieBanner />
              </div>
            </ChatRequestProvider>
          </OperatorStatusProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
