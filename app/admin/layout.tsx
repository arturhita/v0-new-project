"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Loader2 } from "lucide-react"

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.push("/login")
    }
  }, [loading, user, profile, router])

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (profile.role !== "admin") {
    // Questo è un fallback nel caso l'useEffect non faccia in tempo
    return null
  }

  return <DashboardLayout userType="admin">{children}</DashboardLayout>
}
