import type React from "react"
import { SiteNavbar } from "@/components/site-navbar"

interface PlatformLayoutProps {
  children: React.ReactNode
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  return (
    <div className="h-full">
      <SiteNavbar />
      {children}
    </div>
  )
}
