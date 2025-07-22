import type React from "react"
import { BlueConstellationBackground } from "@/components/blue-constellation-background"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // flex-1 per occupare lo spazio disponibile, garantendo che il footer stia in basso
    <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
      <BlueConstellationBackground />
      <div className="z-10 w-full">{children}</div>
    </div>
  )
}
