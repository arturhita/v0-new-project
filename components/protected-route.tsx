"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoadingSpinner from "@/components/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: ("client" | "operator" | "admin")[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) {
      return // Wait for the auth state to be determined
    }

    if (!isAuthenticated) {
      router.replace(redirectTo)
      return
    }

    if (profile && !allowedRoles.includes(profile.role)) {
      // If authenticated but wrong role, redirect to their default dashboard
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [isAuthenticated, profile, isLoading, router, allowedRoles, redirectTo])

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifica autorizzazione..." />
  }

  // Only render children if fully authenticated and role is correct
  if (isAuthenticated && profile && allowedRoles.includes(profile.role)) {
    return <>{children}</>
  }

  // Otherwise, render a spinner while redirecting to prevent flashing content
  return <LoadingSpinner fullScreen message="Reindirizzamento in corso..." />
}
