"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: ("client" | "operator" | "admin")[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user || !profile) {
      router.replace(redirectTo)
      return
    }

    if (!allowedRoles.includes(profile.role)) {
      switch (profile.role) {
        case "admin":
          router.replace("/admin/dashboard")
          break
        case "operator":
          router.replace("/dashboard/operator")
          break
        case "client":
          router.replace("/dashboard/client")
          break
        default:
          router.replace("/")
      }
    }
  }, [user, profile, isLoading, router, allowedRoles, redirectTo])

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifica autorizzazione..." />
  }

  if (user && profile && allowedRoles.includes(profile.role)) {
    return <>{children}</>
  }

  return null
}
