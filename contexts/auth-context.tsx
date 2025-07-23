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
          // 1. Clona profondamente l'intero oggetto `rawProfile` per rimuovere i getter.
          const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

          // 2. Verifica se `services` esiste e se è un oggetto, altrimenti lo inizializza.
          if (!cleanProfile.services || typeof cleanProfile.services !== "object") {
            cleanProfile.services = {}
          }

          const defaultService = { enabled: false, price_per_minute: 0 }

          // Funzione ausiliaria per clonare e validare ogni singolo servizio.
          const processService = (serviceObject: any) => {
            // Se il servizio è assente o non è un oggetto, ritorna il default.
            if (!serviceObject || typeof serviceObject !== "object") {
              return defaultService
            }

            // 3. Esegue una clonazione profonda *indipendente* sul singolo servizio
            // per garantire che sia un oggetto pulito e completamente modificabile.
            const cleanService = JSON.parse(JSON.stringify(serviceObject))

            // 4. Ricostruisce l'oggetto finale, garantendo che tutte le chiavi
            // necessarie siano presenti e abbiano il tipo corretto.
            return {
              enabled: typeof cleanService.enabled === "boolean" ? cleanService.enabled : defaultService.enabled,
              price_per_minute:
                typeof cleanService.price_per_minute === "number"
                  ? cleanService.price_per_minute
                  : defaultService.price_per_minute,
            }
          }

          // Applica il processo a ciascun servizio per renderlo sicuro e completo.
          cleanProfile.services.chat = processService(cleanProfile.services.chat)
          cleanProfile.services.call = processService(cleanProfile.services.call)
          cleanProfile.services.video = processService(cleanProfile.services.video)

          setProfile(cleanProfile as Profile)
        } else {
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
