"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/profile.types"
import { LoadingSpinner } from "@/components/loading-spinner"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  setProfile: (profile: Profile | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Funzione di utilità per sanificare i dati
function sanitizeData<T>(data: T): T {
  if (!data) return data
  try {
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error("Failed to sanitize data:", error)
    return data
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = async () => {
    setLoading(true)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error fetching session:", sessionError.message)
      setLoading(false)
      return
    }

    const currentUser = session?.user ?? null
    setUser(currentUser)

    if (currentUser) {
      await fetchProfile(currentUser.id)
    } else {
      setProfile(null)
    }
    setLoading(false)
  }

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error.message)
      setProfile(null)
    } else if (data) {
      // Sanificazione del profilo prima di impostarlo nello stato
      setProfile(sanitizeData(data as Profile))
    }
  }

  useEffect(() => {
    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    setProfile: (newProfile: Profile | null) => setProfile(sanitizeData(newProfile)),
  }

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
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
