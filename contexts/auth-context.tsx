"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
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
  // Funzione esposta per permettere ai componenti di ricaricare il profilo
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

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/login")
  }, [supabase.auth, router])

  // Funzione di "bonifica" del profilo, ora centralizzata e riutilizzabile
  const fetchAndSetSanitizedProfile = useCallback(
    async (userToFetch: User) => {
      const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", userToFetch.id).single()

      if (error) {
        console.error("Error fetching profile:", error.message)
        setProfile(null)
        return
      }

      if (rawProfile) {
        // STEP FONDAMENTALE: Clonazione profonda e aggressiva dell'intero oggetto
        // ricevuto da Supabase. Questo crea un Plain Old JavaScript Object (POJO)
        // garantito per essere "pulito" e privo di getter, setter o proxy.
        const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

        // Logica di normalizzazione e validazione sull'oggetto GIA' CLONATO.
        // Questo previene errori assicurando che `services` e i suoi figli esistano sempre.
        if (!cleanProfile.services || typeof cleanProfile.services !== "object") {
          cleanProfile.services = {}
        }
        const services = cleanProfile.services
        const defaultService = { enabled: false, price_per_minute: 0 }

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

  // Hook principale che gestisce i cambiamenti di stato dell'autenticazione
  useEffect(() => {
    // Imposta lo stato iniziale su "caricamento"
    setIsLoading(true)

    // Gestisce la sessione al caricamento iniziale della pagina
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const cleanUser = JSON.parse(JSON.stringify(session.user))
        setUser(cleanUser)
        await fetchAndSetSanitizedProfile(cleanUser)
      }
      setIsLoading(false)
    })

    // Si iscrive ai futuri cambiamenti di stato (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const cleanUser = JSON.parse(JSON.stringify(session.user))
        setUser(cleanUser)
        await fetchAndSetSanitizedProfile(cleanUser)
      } else {
        // Se l'utente fa logout, pulisce gli stati
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    // Pulisce la sottoscrizione quando il componente viene smontato
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchAndSetSanitizedProfile])

  // Hook per la protezione delle rotte
  useEffect(() => {
    if (isLoading) return

    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
    if (!user && isProtectedPage) {
      router.replace("/login")
    }
  }, [user, isLoading, pathname, router])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchAndSetSanitizedProfile(user)
    }
  }, [user, fetchAndSetSanitizedProfile])

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
