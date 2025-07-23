"use client"

import { LoginForm } from "./login-form"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a192f]">
      <GoldenConstellationBackground />
      <div className="relative z-10 w-full max-w-md p-4 sm:p-8">
        <div className="rounded-2xl border border-blue-100/20 bg-slate-900/50 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-lg">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Bentornato su Moonthir</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
