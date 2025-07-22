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
      // Non fare nulla mentre l'autenticazione è in corso
      return
    }

    if (!user || !profile) {
      // Se l'utente o il profilo non sono caricati dopo il loading,
      // l'utente non è autenticato correttamente.
      router.replace(redirectTo)
      return
    }

    if (!allowedRoles.includes(profile.role)) {
      // Se l'utente è autenticato ma non ha il ruolo corretto,
      // reindirizzalo alla sua dashboard di default.
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
          router.replace("/") // Fallback generico
      }
    }
  }, [user, profile, isLoading, router, allowedRoles, redirectTo])

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifica autorizzazione..." />
  }

  // Mostra i figli solo se l'utente è autenticato, ha un profilo
  // e il suo ruolo è incluso tra quelli permessi.
  if (user && profile && allowedRoles.includes(profile.role)) {
    return <>{children}</>
  }

  // Altrimenti, non renderizzare nulla mentre avviene il redirect.
  return null
}
