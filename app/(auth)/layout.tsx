import SiteFooter from "@/components/site-footer"
import SiteNavbar from "@/components/site-navbar"
import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}
