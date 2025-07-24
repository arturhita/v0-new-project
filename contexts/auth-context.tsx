"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

// Definizione dell'interfaccia del profilo, garantendo che 'services' sia ben tipizzato.
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

// Tipo del contesto, che ora espone la funzione per forzare l'aggiornamento del profilo.
type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void> // Funzione per aggiornare i dati del profilo on-demand
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Funzione chiave per recuperare e "sanificare" il profilo.
  // Previene l'errore "getter-only" e garantisce una struttura dati consistente.
  const getSanitizedProfile = useCallback(
    async (userToFetch: User): Promise<Profile | null> => {
      const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", userToFetch.id).single()

      if (error || !rawProfile) {
        console.error("AuthContext: Errore nel recupero del profilo o profilo non trovato.", error?.message)
        return null
      }

      // **LA SOLUZIONE**: Clonazione profonda per creare un Plain Old JavaScript Object (POJO).
      // Questo rimuove qualsiasi proxy o getter/setter di Supabase, rendendo l'oggetto sicuro da modificare.
      const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

      // Normalizzazione difensiva: assicura che l'oggetto 'services' e le sue sotto-proprietà
      // esistano sempre, prevenendo errori in altre parti dell'applicazione.
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

  // Hook per gestire i cambiamenti di stato dell'autenticazione (login, logout, refresh pagina).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true)
      if (session?.user) {
        const sanitizedProfile = await getSanitizedProfile(session.user)
        // Anche l'oggetto user viene clonato per sicurezza
        setUser(JSON.parse(JSON.stringify(session.user)))
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

  // Funzione per forzare un aggiornamento del profilo, utile dopo modifiche.
  const refreshProfile = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (currentUser) {
      setIsLoading(true)
      const sanitizedProfile = await getSanitizedProfile(currentUser)
      setProfile(sanitizedProfile)
      setIsLoading(false)
    }
  }, [supabase, getSanitizedProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange gestirà la pulizia dello stato, qui basta reindirizzare.
    router.push("/login")
  }, [supabase.auth, router])

  // Mentre il contesto sta caricando i dati iniziali, mostriamo uno spinner
  // per evitare flash di contenuti o reindirizzamenti errati.
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

// Hook custom per un accesso più semplice e sicuro al contesto.
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve essere utilizzato all'interno di un AuthProvider")
  }
  return context
}
