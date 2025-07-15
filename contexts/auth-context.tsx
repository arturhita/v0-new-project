"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const checkUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      setUser(session.user)
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        setProfile(null)
      } else {
        setProfile(userProfile)
      }
    } else {
      setUser(null)
      setProfile(null)
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // onAuthStateChange will fire on login, logout, etc.
      // Re-checking the user will update the state for the whole app.
      checkUser()
    })

    return () => subscription.unsubscribe()
  }, [checkUser, supabase])

  // This effect now only handles route protection, not login redirection.
  useEffect(() => {
    if (isLoading) return

    const protectedRoutes = ["/admin", "/dashboard"]
    const isProtectedRoute = protectedRoutes.some((path) => pathname.startsWith(path))

    // If user is not logged in and tries to access a protected route, redirect to login
    if (!user && isProtectedRoute) {
      router.push("/login")
      return
    }

    // If user is logged in, check for role-based access
    if (user && profile) {
      const role = profile.role
      if (pathname.startsWith("/admin") && role !== "admin") {
        router.push("/") // or a specific "unauthorized" page
      }
      if (pathname.startsWith("/dashboard/operator") && role !== "operator") {
        router.push("/")
      }
      if (pathname.startsWith("/dashboard/client") && role !== "client") {
        router.push("/")
      }
    }
  }, [user, profile, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020]">
        <LoadingSpinner />
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, profile, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
