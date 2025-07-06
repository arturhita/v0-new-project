import type React from "react"
import SiteNavbar from "@/components/SiteNavbar"
import SiteFooter from "@/components/SiteFooter"

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNavbar />
      <main className="pt-16">{children}</main>
      <SiteFooter />
    </>
  )
}
