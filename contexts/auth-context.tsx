"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/profile.types"
import LoadingSpinner from "@/components/loading-spinner"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Funzione di supporto per la clonazione profonda e sicura
const sanitizeProfile = (profile: any): Profile | null => {
  if (!profile) return null
  // PUNTO CHIAVE: Crea una copia profonda dell'oggetto, rimuovendo qualsiasi getter o proxy.
  // Questo è il modo più robusto per garantire che l'oggetto sia un semplice POJO (Plain Old JavaScript Object).
  return JSON.parse(JSON.stringify(profile))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAndSetProfile = useCallback(
    async (userId: string) => {
      const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Auth Context Error:", error.message)
        setProfile(null)
      } else {
        // Applica la sanificazione qui, prima di salvare nello stato.
        setProfile(sanitizeProfile(rawProfile))
      }
    },
    [supabase],
  )

  useEffect(() => {
    setLoading(true)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser ? JSON.parse(JSON.stringify(currentUser)) : null)

      if (currentUser) {
        await fetchAndSetProfile(currentUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, fetchAndSetProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      setLoading(true)
      await fetchAndSetProfile(user.id)
      setLoading(false)
    }
  }, [user, fetchAndSetProfile])

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
