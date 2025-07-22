import type React from "react"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-900 p-4">
      <GoldenConstellationBackground />
      <div className="z-10 w-full">{children}</div>
    </div>
  )
}
