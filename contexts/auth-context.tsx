"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"

// L'interfaccia del profilo rimane invariata
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

// Il tipo del contesto ora include refreshProfile per aggiornamenti manuali
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
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Inizia sempre come true

  // Funzione centralizzata per recuperare e "bonificare" il profilo.
  // Restituisce un profilo sanificato o null.
  const getSanitizedProfile = useCallback(
    async (userToFetch: User): Promise<Profile | null> => {
      const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", userToFetch.id).single()

      if (error || !rawProfile) {
        console.error("Errore nel recupero del profilo o profilo non trovato:", error?.message)
        return null
      }

      // PASSO PIÙ CRITICO: Clonazione profonda immediata dell'oggetto grezzo.
      // Questo crea un Plain Old JavaScript Object (POJO), rimuovendo tutti i getter/proxy.
      const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

      // Normalizzazione difensiva dell'oggetto 'services' sui dati GIA' CLONATI.
      if (!cleanProfile.services || typeof cleanProfile.services !== "object") {
        cleanProfile.services = {}
      }
      const services = cleanProfile.services
      const defaultService = { enabled: false, price_per_minute: 0 }

      // Ricostruisce l'oggetto services per garantire che sia completo e valido.
      cleanProfile.services = {
        chat: { ...defaultService, ...(services.chat || {}) },
        call: { ...defaultService, ...(services.call || {}) },
        video: { ...defaultService, ...(services.video || {}) },
      }

      return cleanProfile as Profile
    },
    [supabase],
  )

  // Hook principale per gestire i cambiamenti di stato dell'autenticazione.
  useEffect(() => {
    // onAuthStateChange si attiva immediatamente con la sessione corrente,
    // gestendo sia il caricamento iniziale che i login/logout successivi.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true)
      if (session?.user) {
        // 1. "Bonifica" l'oggetto user immediatamente.
        const cleanUser = JSON.parse(JSON.stringify(session.user))
        // 2. Ottiene un profilo già "bonificato".
        const sanitizedProfile = await getSanitizedProfile(cleanUser)

        // 3. Imposta lo stato solo con oggetti puliti e sicuri.
        setUser(cleanUser)
        setProfile(sanitizedProfile)
      } else {
        // L'utente ha effettuato il logout, pulisce tutto.
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    // Pulisce la sottoscrizione quando il componente viene smontato.
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, getSanitizedProfile])

  // Funzione per attivare manualmente un aggiornamento del profilo.
  const refreshProfile = useCallback(async () => {
    if (user) {
      setIsLoading(true)
      const sanitizedProfile = await getSanitizedProfile(user)
      setProfile(sanitizedProfile)
      setIsLoading(false)
    }
  }, [user, getSanitizedProfile])

  // Funzione di logout.
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange si occuperà di pulire lo stato di user/profile.
    router.push("/login")
  }, [supabase.auth, router])

  // Hook per la protezione delle rotte.
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
