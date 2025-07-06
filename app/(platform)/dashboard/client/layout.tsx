"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isPlatform, setIsPlatform] = useState(false)

  useEffect(() => {
    setIsPlatform(pathname.startsWith("/platform"))
  }, [pathname])

  return <>{children}</>
}
