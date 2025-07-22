"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getProfileBypass } from "@/lib/supabase/bypass-client"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database.types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfileSafely = async (currentUser: User) => {
    try {
      const fetchedProfile = await getProfileBypass(currentUser.id)
      if (fetchedProfile) {
        setProfile(fetchedProfile)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error("[AuthContext] Error fetching profile:", error)
      setProfile(null)
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchProfileSafely(currentUser)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfileSafely(currentUser)
      }
      setIsLoading(false)
    }

    checkInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Inizializzazione sessione..." />
  }

  return <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
