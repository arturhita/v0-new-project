import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-provider"
import { SiteNavbar } from "@/components/site-navbar"
import { Toaster } from "@/components/ui/sonner"
import { ConstellationBackground } from "@/components/constellation-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenti Esperti al Tuo Servizio",
  description:
    "Trova i migliori consulenti e cartomanti per una consulenza immediata e personalizzata. Chatta o parla con i nostri esperti.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} bg-[#0F172A] text-slate-100`}>
        <AuthProvider>
          <ConstellationBackground />
          <SiteNavbar />
          <main className="pt-16">{children}</main>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
