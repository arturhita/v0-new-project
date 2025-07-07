import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
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
      <body className={inter.className}>
        <AuthProvider>
          {/* CORREZIONE: Ripristinato {children} e rimossa la struttura duplicata */}
          {children}
          <CookieBanner />
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
