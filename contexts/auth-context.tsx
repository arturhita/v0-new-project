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
    router.push("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    const manageSession = async (session: Session | null) => {
      if (session?.user) {
        const { data: rawProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        const cleanUser = JSON.parse(JSON.stringify(session.user))
        setUser(cleanUser)

        if (error) {
          console.error("Error fetching profile:", error.message)
          setProfile(null)
        } else if (rawProfile) {
          // 1. Clonazione profonda iniziale per rimuovere la maggior parte dei getter/proxy.
          const profileData = JSON.parse(JSON.stringify(rawProfile))

          // 2. Estrae i 'services' e li tratta come un oggetto generico per massima sicurezza.
          const rawServices = (profileData.services || {}) as Record<string, unknown>

          const defaultService = { enabled: false, price_per_minute: 0 }

          // Funzione di "bonifica" ultra-difensiva per ogni singolo servizio.
          const sanitizeService = (service: unknown): { enabled: boolean; price_per_minute: number } => {
            // Se il servizio non è un oggetto valido, ritorna il default.
            if (typeof service !== "object" || service === null) {
              return defaultService
            }

            // 3. Esegue una seconda clonazione profonda *sul singolo servizio*.
            // Questo è il passaggio chiave per eliminare qualsiasi getter residuo
            // che potrebbe essere sopravvissuto alla prima clonazione.
            const cleanService = JSON.parse(JSON.stringify(service))

            // 4. Ricostruisce l'oggetto da zero, validando ogni campo.
            // Questo garantisce che l'oggetto finale sia un POJO puro con la struttura corretta.
            return {
              enabled: typeof cleanService.enabled === "boolean" ? cleanService.enabled : defaultService.enabled,
              price_per_minute:
                typeof cleanService.price_per_minute === "number"
                  ? cleanService.price_per_minute
                  : defaultService.price_per_minute,
            }
          }

          // 5. Applica la sanificazione a ogni servizio e ricostruisce l'oggetto `services`.
          profileData.services = {
            chat: sanitizeService(rawServices.chat),
            call: sanitizeService(rawServices.call),
            video: sanitizeService(rawServices.video),
          }

          // Ora `profileData` è un oggetto garantito per essere completamente modificabile.
          setProfile(profileData as Profile)
        } else {
          // Se non c'è profilo, imposta a null.
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      manageSession(session)
    })

    // Also check session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      manageSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
    if (!user && isProtectedPage) {
      router.replace("/login")
    }
  }, [user, isLoading, pathname, router])

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, isLoading, logout }}>
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
