"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/profile.types"
import { sanitizeData } from "@/lib/data.utils"
import LoadingSpinner from "@/components/loading-spinner"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(sanitizeData(currentUser))

      if (currentUser) {
        const { data: rawProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          console.error("Auth Context Error:", error.message)
          setProfile(null)
        } else {
          setProfile(sanitizeData(rawProfile as Profile))
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange gestirà la pulizia dello stato.
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      setLoading(true)
      const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Auth Context Refresh Error:", error.message)
        setProfile(null)
      } else {
        setProfile(sanitizeData(rawProfile as Profile))
      }
      setLoading(false)
    }
  }, [user, supabase])

  const value = { user, profile, loading, logout, refreshProfile }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <LoadingSpinner />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve essere utilizzato all'interno di un AuthProvider")
  }
  return context
}
