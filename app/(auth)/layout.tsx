import type React from "react"
import { ConstellationBackground } from "@/components/constellation-background"

// Questo layout definisce la UI per le pagine di autenticazione (login, register).
// È minimale e non include la navbar o il footer principali.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <ConstellationBackground />
      <main className="z-10">{children}</main>
    </div>
  )
}
