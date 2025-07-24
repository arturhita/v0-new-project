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
  logout: () => Promise<void>
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

      try {
        const { data: rawProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          console.error("Auth Context: Error fetching profile:", error.message)
          setProfile(null)
        } else if (rawProfile) {
          // FASE 2: Sanifica il profilo immediatamente dopo averlo ricevuto.
          const sanitizedProfile = sanitizeData(rawProfile as Profile)
          setProfile(sanitizedProfile)
        }
      } catch (e) {
        console.error("Auth Context: An unexpected error occurred while refreshing profile:", e)
        setProfile(null)
      }
    },
    [supabase],
  )

  useEffect(() => {
    // Funzione per la gestione del cambio di stato di autenticazione
    const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      console.log(`Auth state changed: ${event}`)
      setLoading(true)

      const currentUser = session?.user ?? null

      // FASE 1: Sanifica l'oggetto utente immediatamente.
      const sanitizedUser = sanitizeData(currentUser)
      setUser(sanitizedUser)

      // FASE 2: Passa l'utente sanificato per recuperare e sanificare il profilo.
      await refreshProfile(sanitizedUser)

      setLoading(false)
    }

    // Imposta lo stato iniziale al caricamento del provider
    const setInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      await handleAuthStateChange("INITIAL_SESSION", session)
    }

    setInitialSession()

    // Ascolta i futuri cambiamenti di stato
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, refreshProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange si occuperà di pulire lo stato (user e profile a null).
  }, [supabase])

  const value = {
    user,
    profile,
    loading,
    logout,
    refreshProfile: () => refreshProfile(user), // La funzione pubblica chiama quella interna
  }

  // Mostra un caricatore a schermo intero solo durante il primissimo caricamento
  if (loading && !user && !profile) {
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
