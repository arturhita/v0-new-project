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
    // The onAuthStateChange listener will handle state updates and redirects
  }, [supabase.auth])

  // 1. Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Sanitize the user object immediately to prevent mutation errors
      const sanitizedUser = session?.user ? JSON.parse(JSON.stringify(session.user)) : null
      setUser(sanitizedUser)

      // If user logs out, clear profile immediately
      if (_event === "SIGNED_OUT") {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // 2. Fetch profile when user state changes
  useEffect(() => {
    // Set loading to true only when we start fetching a profile for a new user
    if (user && !profile) {
      setIsLoading(true)
    }

    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data: userProfile, error }) => {
          if (error) {
            console.error("Error fetching profile:", error)
            setProfile(null)
          } else {
            // Sanitize the profile object
            const cleanProfile = userProfile ? JSON.parse(JSON.stringify(userProfile)) : null
            setProfile(cleanProfile as Profile | null)
          }
          setIsLoading(false)
        })
    } else {
      // No user, so no profile and we are done loading.
      setProfile(null)
      setIsLoading(false)
    }
  }, [user, supabase])

  // 3. Handle redirects based on auth state
  useEffect(() => {
    // Don't redirect until loading is complete
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    // If on a protected page without a user, redirect to login
    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    // If on an auth page with a user and profile, redirect to the appropriate dashboard
    if (user && profile && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

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
