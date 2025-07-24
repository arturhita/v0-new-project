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
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error) {
        console.error("Auth Context: Errore nel recupero del profilo:", error.message)
        setProfile(null)
      } else if (data) {
        setProfile(sanitizeData(data as Profile))
      }
    },
    [supabase],
  )

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.id)
      }
      setLoading(false)
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [fetchProfile, supabase.auth])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  const value = { user, profile, loading, refreshProfile }

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
