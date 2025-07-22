"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoadingSpinner from "@/components/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: ("client" | "operator" | "admin")[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  const router = useRouter()
  const hasPermission = profile && allowedRoles.includes(profile.role)

  useEffect(() => {
    if (isLoading) {
      console.log("[ProtectedRoute] Loading...")
    } else if (!isAuthenticated) {
      console.log("[ProtectedRoute] User not authenticated. Redirecting...")
    } else if (!hasPermission) {
      let destination = "/"
      if (profile?.role === "admin") destination = "/admin/dashboard"
      else if (profile?.role === "operator") destination = "/dashboard/operator"
      else if (profile?.role === "client") destination = "/dashboard/client"

      console.log(`[ProtectedRoute] Role mismatch. Redirecting to ${destination}`)
      router.replace(destination)
    }
  }, [isAuthenticated, hasPermission, profile, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner fullScreen message="Accesso richiesto..." />
  }

  if (!hasPermission) {
    return <LoadingSpinner fullScreen message="Permesso negato. Reindirizzamento..." />
  }

  return <>{children}</>
}
