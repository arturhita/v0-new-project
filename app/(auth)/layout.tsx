import { GoldenConstellationBackground } from "@/components/golden-constellation-background"
import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden py-12">
      <GoldenConstellationBackground />
      <div className="z-10 w-full">{children}</div>
    </div>
  )
}
