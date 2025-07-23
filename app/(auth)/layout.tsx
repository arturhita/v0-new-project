import type React from "react"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"

// Questo layout definisce la UI per le pagine di autenticazione (login, register).
// È minimale e non include la navbar o il footer principali.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-900 p-4">
      <GoldenConstellationBackground />
      <main className="z-10 w-full max-w-md">{children}</main>
    </div>
  )
}
