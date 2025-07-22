"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: ("client" | "operator" | "admin")[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifica autorizzazione..." />
  }

  if (!isAuthenticated) {
    // The middleware should have already redirected. This is a fallback.
    return <LoadingSpinner fullScreen message="Accesso richiesto..." />
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    let destination = "/"
    if (profile.role === "admin") destination = "/admin/dashboard"
    else if (profile.role === "operator") destination = "/dashboard/operator"
    else if (profile.role === "client") destination = "/dashboard/client"

    router.replace(destination)
    return <LoadingSpinner fullScreen message="Permesso negato. Reindirizzamento..." />
  }

  return <>{children}</>
}
