import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moonthir - Consulenza Mistica",
  description: "Trova la tua guida spirituale. Esperti in cartomanzia, astrologia e numerologia disponibili 24/7.",
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
        <div className="flex flex-col min-h-screen">{children}</div>
        <Toaster />
      </body>
    </html>
  )
}
