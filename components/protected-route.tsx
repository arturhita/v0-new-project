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

  // While the AuthContext is figuring out the user's state, show a loader.
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifica autorizzazione..." />
  }

  // If the user is definitively not authenticated, AuthContext will handle the redirect.
  // We show a loader here to prevent content flashing while the redirect happens.
  if (!isAuthenticated) {
    return <LoadingSpinner fullScreen message="Accesso richiesto..." />
  }

  // If the user is authenticated, but their role is not in the allowed list.
  if (profile && !allowedRoles.includes(profile.role)) {
    // Redirect them to their own dashboard, not the login page.
    let destination = "/"
    if (profile.role === "admin") destination = "/admin/dashboard"
    else if (profile.role === "operator") destination = "/dashboard/operator"
    else if (profile.role === "client") destination = "/dashboard/client"

    console.log(`[ProtectedRoute] Role mismatch. Redirecting to ${destination}.`)
    router.replace(destination)

    // Show a loader while redirecting.
    return <LoadingSpinner fullScreen message="Permesso negato. Reindirizzamento..." />
  }

  // If all checks pass (not loading, authenticated, correct role), render the page.
  return <>{children}</>
}
