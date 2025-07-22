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

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (isAuthenticated && profile && !allowedRoles.includes(profile.role)) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"

      console.log(`[ProtectedRoute] Role mismatch. Redirecting to ${destination}`)
      router.replace(destination)
    }
  }, [isLoading, isAuthenticated, profile, allowedRoles, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner fullScreen />
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    return <LoadingSpinner fullScreen message="Reindirizzamento in corso..." />
  }

  return <>{children}</>
}
