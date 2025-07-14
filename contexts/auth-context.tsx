"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
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
      if (session?.user) {
        setUser(session.user)
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(userProfile)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const login = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      return { success: false, error: error.message }
    }
    if (data.user) {
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError || !userProfile) {
        await supabase.auth.signOut()
        setLoading(false)
        return { success: false, error: "Profilo utente non trovato o errore nel recupero." }
      }

      setUser(data.user)
      setProfile(userProfile)

      switch (userProfile.role) {
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
    }
    setLoading(false)
    return { success: true }
  }

  const logout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/login")
    setLoading(false)
  }

  const value = {
    user,
    profile,
    login,
    logout,
    loading,
  }

  const protectedRoutes = ["/admin", "/dashboard"]
  const isProtectedRoute = protectedRoutes.some((path) => pathname.startsWith(path))

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
