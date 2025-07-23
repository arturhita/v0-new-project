"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // The onAuthStateChange listener will handle the redirect
  }, [supabase.auth])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ? JSON.parse(JSON.stringify(session.user)) : null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

        // Sanitize the profile object to prevent the "getter-only" error
        const cleanProfile = userProfile ? JSON.parse(JSON.stringify(userProfile)) : null
        setProfile(cleanProfile as Profile | null)
      } else {
        setProfile(null)
      }

      if (event === "SIGNED_OUT") {
        router.replace("/login")
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    if (user && profile && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  // By not returning a loading spinner here, we prevent the entire app from unmounting,
  // which was the root cause of the "getter-only" error.
  // Individual pages can show their own loading states if needed.

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
