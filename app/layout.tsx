import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { SiteNavbar } from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"
import { CookieBanner } from "@/components/cookie-banner"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - La tua guida astrale",
  description:
    "Esplora il mondo dell'astrologia e della cartomanzia con i nostri esperti. Consulti personalizzati, oroscopo, tarocchi e molto altro.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={`${inter.className} bg-gray-900 text-gray-200`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <SiteNavbar />
            <main className="flex-grow flex flex-col pt-16">{children}</main>
            <SiteFooter />
          </div>
          <CookieBanner />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
