"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/profile.types"
import { sanitizeData } from "@/lib/data.utils"
import LoadingSpinner from "@/components/loading-spinner"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(
    async (currentUser: User | null) => {
      if (!currentUser) {
        setProfile(null)
        return
      }

      // Non impostare loading qui per evitare sfarfallii su refresh veloci
      try {
        const { data: rawProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error.message)
          setProfile(null)
        } else if (rawProfile) {
          // Sanitize the profile data immediately upon receipt
          const sanitizedProfile = sanitizeData(rawProfile)
          setProfile(sanitizedProfile)
        }
      } catch (e) {
        console.error("An unexpected error occurred while refreshing profile:", e)
        setProfile(null)
      }
    },
    [supabase],
  )

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      const sanitizedUser = sanitizeData(currentUser)
      setUser(sanitizedUser)
      await refreshProfile(sanitizedUser)
      setLoading(false)
    }

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user ?? null
        const sanitizedUser = sanitizeData(currentUser)
        setUser(sanitizedUser)
        // Non reimpostare il loading qui per evitare sfarfallii durante il logout/login
        await refreshProfile(sanitizedUser)
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, refreshProfile])

  const value = {
    user,
    profile,
    loading,
    refreshProfile: () => refreshProfile(user),
  }

  if (loading) {
    return <LoadingSpinner fullPage />
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
