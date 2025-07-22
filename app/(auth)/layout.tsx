import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <SiteNavbar />
      <main className="flex-grow container mx-auto px-4">{children}</main>
      <SiteFooter />
    </div>
  )
}
