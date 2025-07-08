import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"
import SiteFooter from "@/components/site-footer"

/**
 * Layout for the main public-facing pages of the platform.
 * It includes the site navigation bar and footer.
 */
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <SiteNavbar />
      <main className="flex-grow pt-16">{/* pt-16 to offset fixed navbar height */ children}</main>
      <SiteFooter />
    </div>
  )
}
