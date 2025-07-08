"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("client" | "operator" | "admin")[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles = ["client", "operator", "admin"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (!allowedRoles.includes(user.role)) {
        // Redirect basato sul ruolo
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
        return
      }
    }
  }, [user, loading, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
