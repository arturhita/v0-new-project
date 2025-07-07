"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserProfile } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<UserProfile["role"]>
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Aspetta che il caricamento dello stato di autenticazione sia finito

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Se l'utente non ha il ruolo corretto, reindirizzalo alla sua dashboard di default
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "operator":
          router.push("/dashboard/operator")
          break
        case "client":
          router.push("/dashboard/client")
          break
        default:
          router.push("/")
      }
    }
  }, [isAuthenticated, loading, user, router, allowedRoles])

  if (loading || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    // Mostra un loader mentre si verifica lo stato o si reindirizza
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
