import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { CookieBanner } from "@/components/cookie-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenti del Benessere",
  description: "Trova i migliori consulenti di astrologia, tarocchi e numerologia per una guida personalizzata.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <SiteNavbar />
            <main className="flex-grow">{/* CORREZIONE: Rimosso pt-16 */}</main>
            <SiteFooter />
          </div>
          <CookieBanner />
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
