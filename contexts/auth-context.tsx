"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"

// Interfaccia del profilo, garantendo che 'services' sia sempre presente e ben tipizzato.
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
  services: {
    chat: { enabled: boolean; price_per_minute: number }
    call: { enabled: boolean; price_per_minute: number }
    video: { enabled: boolean; price_per_minute: number }
  }
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Funzione chiave per recuperare e "sanificare" il profilo.
  const getSanitizedProfile = useCallback(
    async (userToFetch: User): Promise<Profile | null> => {
      const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", userToFetch.id).single()

      if (error || !rawProfile) {
        console.error("AuthContext: Profilo non trovato o errore.", error?.message)
        // Se il profilo non esiste, potrebbe essere un errore di sincronizzazione.
        // Tentare un logout forzato per resettare lo stato.
        await supabase.auth.signOut()
        return null
      }

      // **LA SOLUZIONE DEFINITIVA**: Clonazione profonda per creare un Plain Old JavaScript Object (POJO).
      // Questo rimuove qualsiasi proxy o getter/setter di Supabase, rendendo l'oggetto sicuro da modificare.
      const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

      // Normalizzazione difensiva: assicura che l'oggetto 'services' e le sue sotto-proprietà
      // esistano sempre, anche se fossero null nel DB (grazie al trigger SQL, non dovrebbe più accadere).
      const services = cleanProfile.services || {}
      const defaultService = { enabled: false, price_per_minute: 0 }

      cleanProfile.services = {
        chat: { ...defaultService, ...(services.chat || {}) },
        call: { ...defaultService, ...(services.call || {}) },
        video: { ...defaultService, ...(services.video || {}) },
      }

      return cleanProfile as Profile
    },
    [supabase],
  )

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true)
      if (session?.user) {
        const sanitizedProfile = await getSanitizedProfile(session.user)
        setUser(session.user)
        setProfile(sanitizedProfile)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, getSanitizedProfile])

  const refreshProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      setIsLoading(true)
      const sanitizedProfile = await getSanitizedProfile(currentUser)
      setProfile(sanitizedProfile)
      setIsLoading(false)
    }
  }, [supabase, getSanitizedProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Non è necessario reindirizzare qui, onAuthStateChange gestirà lo stato
    // e i layout/pagine gestiranno il reindirizzamento.
  }, [supabase.auth])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, isLoading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve essere utilizzato all'interno di un AuthProvider")
  }
  return context
}
