import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavbar } from "@/components/site-navbar"
import { CookieBanner } from "@/components/cookie-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenza Mistica",
  description: "La tua guida nel mondo della consulenza mistica e astrologica.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <SiteNavbar />
            <main className="flex-grow">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  )
}
