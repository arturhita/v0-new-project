"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/profile.types"
import { deepCloneSafe } from "@/lib/data.utils"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(
    async (user: User) => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }
      // Sanitize the data immediately upon fetching
      return deepCloneSafe(data)
    },
    [supabase],
  )

  const refreshProfile = useCallback(async () => {
    if (user) {
      const refreshedProfile = await fetchProfile(user)
      if (refreshedProfile) {
        setProfile(refreshedProfile)
      }
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const getSession = async () => {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const fetchedProfile = await fetchProfile(session.user)
        setProfile(fetchedProfile)
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const fetchedProfile = await fetchProfile(session.user)
        setProfile(fetchedProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  return <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
