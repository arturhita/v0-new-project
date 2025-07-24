"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import LoadingSpinner from "@/components/loading-spinner"

// Funzione di utilità per sanificare QUALSIASI oggetto da Supabase.
// Rimuove i getter e crea un Plain Old JavaScript Object (POJO).
// Questa è la difesa centrale contro l'errore "Cannot set property...".
function sanitizeObject<T>(data: T): T {
  if (!data) return data
  return JSON.parse(JSON.stringify(data))
}

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

  const getAndSetSession = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Errore nel recuperare la sessione:", error)
      setIsLoading(false)
      return
    }

    if (session?.user) {
      const { data: rawProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError || !rawProfile) {
        console.error("AuthContext: Errore nel recupero del profilo o profilo non trovato.", profileError?.message)
        setUser(sanitizeObject(session.user))
        setProfile(null)
      } else {
        const cleanProfile = sanitizeObject(rawProfile)

        const services = cleanProfile.services || {}
        const defaultService = { enabled: false, price_per_minute: 0 }
        cleanProfile.services = {
          chat: { ...defaultService, ...(services.chat || {}) },
          call: { ...defaultService, ...(services.call || {}) },
          video: { ...defaultService, ...(services.video || {}) },
        }

        setUser(sanitizeObject(session.user))
        setProfile(cleanProfile as Profile)
      }
    } else {
      setUser(null)
      setProfile(null)
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    getAndSetSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      getAndSetSession()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [getAndSetSession, supabase.auth])

  const refreshProfile = useCallback(async () => {
    await getAndSetSession()
  }, [getAndSetSession])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
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
