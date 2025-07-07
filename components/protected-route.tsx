"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

type Role = "client" | "operator" | "admin"

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    } else if (!loading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      // Redirect based on role if not allowed
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "operator":
          router.push("/dashboard/operator")
          break
        default:
          router.push("/")
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, router])

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
          <p className="mt-4 text-lg">Caricamento in corso...</p>
        </div>
      </div>
    )
  }

  if (allowedRoles.includes(user.role)) {
    return <>{children}</>
  }

  // Fallback while redirecting
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
        <p className="mt-4 text-lg">Reindirizzamento in corso...</p>
      </div>
    </div>
  )
}
