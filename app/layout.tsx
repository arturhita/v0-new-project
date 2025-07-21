import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { CookieBanner } from "@/components/cookie-banner" // Corretto: importazione nominativa

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenza Mistica",
  description: "La tua guida nel mondo della consulenza mistica e spirituale.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  )
}
