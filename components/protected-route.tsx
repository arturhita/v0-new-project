"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: Array<"client" | "operator" | "admin">
}) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    } else if (!loading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      // Utente loggato ma con ruolo non autorizzato, reindirizza alla sua dashboard
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
  }, [user, loading, isAuthenticated, allowedRoles, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isAuthenticated && user && allowedRoles.includes(user.role)) {
    return <>{children}</>
  }

  // Mostra il loader anche durante il reindirizzamento per evitare flash di contenuto
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}
