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
  }, [supabase.auth])

  // Effect 1: Listen for auth state changes from Supabase
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Sanitize the user object immediately to prevent "getter-only" errors
      const sanitizedUser = session?.user ? JSON.parse(JSON.stringify(session.user)) : null
      setUser(sanitizedUser)

      // If user logs out, ensure the profile is also cleared
      if (_event === "SIGNED_OUT") {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Effect 2: Fetch the user's profile when the user object changes
  useEffect(() => {
    if (user) {
      setIsLoading(true) // We are now loading the profile data
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching profile:", error.message)
            setProfile(null)
          } else {
            // Sanitize the profile object as well
            setProfile(data ? JSON.parse(JSON.stringify(data)) : null)
          }
          setIsLoading(false) // Finished loading profile
        })
    } else {
      // No user, so no profile is needed, and we are not loading
      setProfile(null)
      setIsLoading(false)
    }
  }, [user, supabase])

  // Effect 3: Handle all application redirects based on auth state
  useEffect(() => {
    // Wait until the initial user and profile load is complete
    if (isLoading) {
      return
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    // If a non-authenticated user tries to access a protected page, redirect them to login
    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    // If an authenticated user is on an auth page, redirect them to their dashboard
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
