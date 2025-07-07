"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { RefreshCw } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<"admin" | "operator" | "client">
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      if (user && !allowedRoles.includes(user.role)) {
        // Redirect based on their actual role
        switch (user.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "operator":
            router.push("/dashboard/operator")
            break
          default:
            router.push("/")
            break
        }
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router])

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
          <p className="text-slate-600">Caricamento in corso...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
