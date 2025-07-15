"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"
import { logout as logoutAction } from "@/lib/actions/auth.actions"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(userProfile)
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)
      const currentUser = session?.user
      setUser(currentUser ?? null)
      if (currentUser) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const logout = async () => {
    await logoutAction()
    router.refresh()
  }

  const value = {
    user,
    profile,
    logout,
    loading,
  }

  const protectedRoutes = ["/admin", "/dashboard"]
  const isProtectedRoute = protectedRoutes.some((path) => pathname.startsWith(path))
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user && isProtectedRoute) {
    if (typeof window !== "undefined") {
      router.push("/login")
    }
    return <LoadingSpinner />
  }

  if (user && profile) {
    if (isAuthPage) {
      switch (profile.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "operator":
          router.push("/dashboard/operator")
          break
        case "client":
        default:
          router.push("/dashboard/client")
          break
      }
      return <LoadingSpinner />
    }

    if (pathname.startsWith("/admin") && profile.role !== "admin") {
      router.push("/")
      return <LoadingSpinner />
    }
    if (pathname.startsWith("/dashboard/operator") && profile.role !== "operator") {
      router.push("/")
      return <LoadingSpinner />
    }
    if (pathname.startsWith("/dashboard/client") && profile.role !== "client") {
      router.push("/")
      return <LoadingSpinner />
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
