"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  isOperator: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        setIsLoading(false)
        return
      }

      if (session) {
        setUser(session.user)
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(profileData)
      }
      setIsLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const fetchProfile = async () => {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
          setProfile(profileData)
        }
        fetchProfile()
      } else {
        setProfile(null)
      }
      // No need to set loading here as it's for subsequent changes
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === "admin",
    isOperator: profile?.role === "operator",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
