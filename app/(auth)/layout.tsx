import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { ConstellationBackground } from "@/components/constellation-background"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir Logo"
              width={180}
              height={50}
              className="mx-auto"
            />
          </Link>
        </div>
        <div className="backdrop-blur-sm bg-white/5 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}
