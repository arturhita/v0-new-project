"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"

interface Profile {
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
  // Aggiungiamo una funzione per forzare l'aggiornamento del profilo dall'esterno
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Funzione per recuperare e "bonificare" il profilo
  const fetchAndSetProfile = useCallback(
    async (userToFetch: User) => {
      const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", userToFetch.id).single()

      if (error) {
        console.error("Error fetching profile:", error.message)
        setProfile(null)
        return
      }

      if (rawProfile) {
        // LA SOLUZIONE DEFINITIVA: Clona profondamente i dati grezzi da Supabase.
        // Questo crea un oggetto JavaScript semplice, rimuovendo tutti i getter e prevenendo l'errore.
        const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

        // Controllo difensivo per l'oggetto services.
        if (!cleanProfile.services || typeof cleanProfile.services !== "object") {
          cleanProfile.services = {}
        }

        const services = cleanProfile.services
        const defaultService = { enabled: false, price_per_minute: 0 }

        // Assicura che ogni servizio sia un oggetto completo e valido.
        cleanProfile.services.chat = { ...defaultService, ...(services.chat || {}) }
        cleanProfile.services.call = { ...defaultService, ...(services.call || {}) }
        cleanProfile.services.video = { ...defaultService, ...(services.video || {}) }

        setProfile(cleanProfile as Profile)
      } else {
        setProfile(null)
      }
    },
    [supabase],
  )

  // Funzione per gestire la sessione, ora più snella
  const manageSession = useCallback(
    async (session: Session | null) => {
      if (session?.user) {
        // Clona l'oggetto user per sicurezza prima di impostarlo nello stato
        const cleanUser = JSON.parse(JSON.stringify(session.user))
        setUser(cleanUser)
        await fetchAndSetProfile(cleanUser)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    },
    [fetchAndSetProfile],
  )

  // Funzione per aggiornare manualmente il profilo, esposta dal contesto
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchAndSetProfile(user)
    }
  }, [user, fetchAndSetProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Reset manuale degli stati per una transizione pulita
    setUser(null)
    setProfile(null)
    router.push("/login")
  }, [supabase.auth, router])

  // Hook principale per l'autenticazione
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      manageSession(session)
    })

    // Gestisce la sessione al caricamento iniziale
    supabase.auth.getSession().then(({ data: { session } }) => {
      manageSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [manageSession, supabase.auth])

  // Hook per proteggere le rotte
  useEffect(() => {
    if (isLoading) return

    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
    if (!user && isProtectedPage) {
      router.replace("/login")
    }
  }, [user, isLoading, pathname, router])

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, isLoading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
