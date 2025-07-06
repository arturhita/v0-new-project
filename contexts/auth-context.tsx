"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Definisce il tipo Profile per corrispondere allo schema del database
export interface Profile {
  id: string
  created_at?: string
  role: "admin" | "operator" | "client"
  full_name: string | null
  stage_name: string | null
  email: string | null
  bio: string | null
  profile_image_url: string | null
  is_available: boolean
  specializations?: string[]
  average_rating?: number
  review_count?: number
  service_prices?: {
    chat?: number
    call?: number
    email?: number
  } | null
  availability_schedule?: any
  commission_rate?: number
}

type AuthContextType = {
  supabase: SupabaseClient
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(userProfile as Profile)
      }
      setLoading(false)
    }

    getSessionAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(userProfile as Profile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, pass: string) => {
    // This is now handled directly in the login page component
    // We can leave this empty or throw an error if it's called.
    console.warn("login function in AuthContext is deprecated.")
    return { user: null, error: new Error("Deprecated function.") }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const register = async (email: string, pass: string, fullName: string) => {
    // This is now handled directly in the register page component
    console.warn("register function in AuthContext is deprecated.")
    return { user: null, error: new Error("Deprecated function.") }
  }

  const value = { supabase, user, profile, loading, isAuthenticated: !!user, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
