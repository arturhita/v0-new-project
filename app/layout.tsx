import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/contexts/providers"
import { Toaster } from "sonner"
import { CookieBanner } from "@/components/cookie-banner"

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
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
