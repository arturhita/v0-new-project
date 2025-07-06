"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: "admin" | "operator" | "client"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        // If not loading and no profile, redirect to login
        router.push("/login")
      } else if (profile.role !== requiredRole) {
        // If role doesn't match, redirect to a safe page
        console.warn(`Access denied. User role: '${profile.role}', required: '${requiredRole}'`)
        switch (profile.role) {
          case "admin":
            router.push("/admin")
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
    }
  }, [profile, loading, requiredRole, router])

  if (loading || !profile || profile.role !== requiredRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Verifica in corso...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
