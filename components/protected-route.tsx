"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import type { UserRole } from "@/types/user.types"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      // Se sta ancora caricando, non fare nulla.
      return
    }

    if (!isAuthenticated) {
      // Se non è autenticato, reindirizza al login.
      router.push("/login")
      return
    }

    if (user && user.role !== requiredRole) {
      // Se l'utente ha un ruolo diverso da quello richiesto,
      // reindirizzalo alla sua dashboard corretta.
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
          // Fallback nel caso il ruolo non sia gestito
          router.push("/")
          break
      }
    }
  }, [isAuthenticated, loading, user, requiredRole, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-16 w-16 animate-spin text-white" />
      </div>
    )
  }

  if (isAuthenticated && user?.role === requiredRole) {
    // Se l'utente è autenticato e ha il ruolo corretto, mostra la pagina.
    return <>{children}</>
  }

  // Altrimenti, non mostrare nulla (o un altro loader) mentre avviene il reindirizzamento.
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <Loader2 className="h-16 w-16 animate-spin text-white" />
    </div>
  )
}
