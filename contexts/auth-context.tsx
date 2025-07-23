"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
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

  // Use the full session as the source of truth
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Always start loading

  const user = session?.user ?? null

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    router.push("/login") // Force redirect on logout
  }, [supabase.auth, router])

  // Effect 1: Get initial session and subscribe to auth changes
  useEffect(() => {
    // This function runs once to get the initial state
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sanitizedSession = session ? JSON.parse(JSON.stringify(session)) : null
      setSession(sanitizedSession)
      // The profile fetching effect will handle setting isLoading to false
    })

    // This subscription handles all subsequent auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sanitizedSession = session ? JSON.parse(JSON.stringify(session)) : null
      setSession(sanitizedSession)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Effect 2: Fetch user profile whenever the user object changes
  useEffect(() => {
    if (user) {
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
            const cleanProfile = data ? JSON.parse(JSON.stringify(data)) : null
            setProfile(cleanProfile)
          }
          // Loading is complete after profile is fetched (or failed)
          setIsLoading(false)
        })
    } else {
      // No user, so no profile. Loading is complete.
      setProfile(null)
      setIsLoading(false)
    }
  }, [user, supabase])

  // Effect 3: Handle route protection and redirection
  useEffect(() => {
    // Don't do anything until the initial loading is finished
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    // If not logged in and on a protected page, redirect to login
    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    // If logged in (with profile) and on an auth page, redirect to dashboard
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
