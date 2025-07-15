"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"

type Profile = {
  id: string
  role: "admin" | "operator" | "client"
  stage_name: string
  avatar_url: string
} | null

type AuthContextType = {
  user: User | null
  profile: Profile
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(
    async (currentUser: User | null) => {
      if (currentUser) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, role, stage_name, avatar_url")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          setProfile(null)
        } else {
          setProfile(data as Profile)
        }
      } else {
        setProfile(null)
      }
    },
    [supabase],
  )

  useEffect(() => {
    // This is the single source of truth for auth state.
    // It fires on initial load, on login, and on logout.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await fetchProfile(currentUser)
      // Set loading to false only after the first check is complete.
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const refreshProfile = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    await fetchProfile(currentUser)
  }, [supabase, fetchProfile])

  const value = {
    user,
    profile,
    isLoading,
    refreshProfile,
  }

  // Render a loading spinner until the initial auth check is complete
  return <AuthContext.Provider value={value}>{isLoading ? <LoadingSpinner /> : children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
