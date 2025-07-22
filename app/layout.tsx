import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CookieBanner } from "@/components/cookie-banner"
import { SiteNavbar } from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import SupabaseListener from "@/lib/supabase/listener"

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
      <body className={`${inter.className} bg-gray-900 flex flex-col min-h-screen`}>
        <SupabaseListener serverAccessToken={session?.access_token} />
        <Suspense fallback={null}>
          <SiteNavbar />
          <main className="flex-grow flex flex-col pt-16">{children}</main>
          <SiteFooter />
          <Toaster />
          <CookieBanner />
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
