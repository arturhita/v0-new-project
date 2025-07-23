"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  user,
  profile,
  children,
}: {
  user: User | null
  profile: Profile | null
  children: React.ReactNode
}) {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Se lo stato di autenticazione cambia (login, logout) o l'utente cambia,
      // forza un refresh completo della pagina.
      // Questo ricarica i Server Components (incluso il RootLayout) e garantisce
      // che l'intera applicazione abbia lo stato di autenticazione più recente,
      // risolvendo i problemi di desincronizzazione client-server.
      if (session?.user.id !== user?.id) {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, user])

  const logout = async () => {
    // La logica di reindirizzamento è gestita dal listener onAuthStateChange
    // che chiamerà router.refresh(), portando l'utente alla pagina di login
    // a causa delle protezioni sui layout delle dashboard.
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        logout,
      }}
    >
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
