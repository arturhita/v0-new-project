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
      return // Wait for the auth state to be determined from AuthProvider
    }

    // AuthProvider is the single source of truth for redirecting unauthenticated users.
    // This component's only job is to handle role mismatches for *authenticated* users.
    if (isAuthenticated && profile && !allowedRoles.includes(profile.role)) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [isAuthenticated, profile, isLoading, router, allowedRoles])

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifica autorizzazione..." />
  }

  // If authenticated and the role is correct, render the children.
  if (isAuthenticated && profile && allowedRoles.includes(profile.role)) {
    return <>{children}</>
  }

  // In all other cases (e.g., not authenticated, role mismatch while redirecting),
  // show a spinner. AuthProvider is responsible for the actual redirect logic.
  return <LoadingSpinner fullScreen message="Reindirizzamento in corso..." />
}
