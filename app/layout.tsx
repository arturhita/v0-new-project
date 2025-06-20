import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mysthya - Piattaforma di Consulenza Spirituale",
  description:
    "Mysthya - La tua piattaforma di consulenza spirituale. Cartomanzia, Tarocchi, Astrologia con esperti qualificati disponibili 24/7",
  keywords: "mysthya, consulenza spirituale, cartomanzia, tarocchi, astrologia, sensitivi, numerologia, oroscopo",
  authors: [{ name: "Mysthya Team" }],
  creator: "Mysthya",
  publisher: "Mysthya",
  robots: "index, follow",
  metadataBase: new URL("https://mysthya.com"),
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://mysthya.com",
    title: "Mysthya - Consulenza Spirituale Online",
    description:
      "Scopri il tuo futuro con i nostri esperti di cartomanzia, tarocchi e astrologia. Consulenze immediate 24/7",
    siteName: "Mysthya",
    images: [
      {
        url: "/og-mysthya.jpg",
        width: 1200,
        height: 630,
        alt: "Mysthya - Consulenza Spirituale Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mysthya - Consulenza Spirituale",
    description: "Scopri il tuo futuro con esperti qualificati",
    images: ["/og-mysthya.jpg"],
  },
  alternates: {
    canonical: "https://mysthya.com",
  },
    generator: 'v0.dev'
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <h2 className="text-white text-xl font-semibold">Caricamento Mysthya...</h2>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="application-name" content="Mysthya" />
      </head>
      <body className={inter.className}>
        <Suspense fallback={<LoadingFallback />}>
          {children}
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  )
}
