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
  services: any
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

  // Effect 1: Listen for auth state changes from Supabase.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Hard clone the user object to create a clean POJO
        const cleanUser = JSON.parse(JSON.stringify(session.user))
        setUser(cleanUser)
      } else {
        setUser(null)
      }

      if (_event === "SIGNED_OUT") {
        setProfile(null)
        router.replace("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  // Effect 2: Fetch the user's profile when the user object changes.
  useEffect(() => {
    if (user) {
      setIsLoading(true)
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data: rawProfile, error }) => {
          if (error) {
            console.error("Error fetching profile:", error.message)
            setProfile(null)
          } else if (rawProfile) {
            // DEFINITIVE FIX:
            // 1. Hard clone the profile to get a clean POJO, stripping Supabase proxies.
            const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

            // 2. Defensive check: If services is null/undefined (due to old data),
            //    initialize it to prevent downstream errors.
            if (!cleanProfile.services) {
              cleanProfile.services = {
                chat: { enabled: false, price_per_minute: 0 },
                call: { enabled: false, price_per_minute: 0 },
                video: { enabled: false, price_per_minute: 0 },
              }
            }
            setProfile(cleanProfile)
          } else {
            setProfile(null)
          }
          setIsLoading(false)
        })
    } else {
      setProfile(null)
      setIsLoading(false)
    }
  }, [user, supabase])

  // Effect 3: Protect routes
  useEffect(() => {
    if (isLoading) {
      return
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    // If not authenticated and on a protected page, redirect to login
    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    // If authenticated and on an auth page, redirect to the correct dashboard
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
