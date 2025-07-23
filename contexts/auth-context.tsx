"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { Profile } from "@/types/database" // Assumendo che tu abbia un file di tipi

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  user: initialUser,
  profile: initialProfile,
  children,
}: {
  user: User | null
  profile: Profile | null
  children: React.ReactNode
}) {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState(initialProfile)

  // Questo effetto sincronizza lo stato del contesto se le props fornite dal server cambiano
  // durante una navigazione lato client.
  useEffect(() => {
    setUser(initialUser)
    setProfile(initialProfile)
  }, [initialUser, initialProfile])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Quando lo stato di autenticazione cambia (es. SIGNED_IN, SIGNED_OUT),
      // non impostiamo più lo stato manualmente qui.
      // Invece, facciamo un refresh della pagina. Questo forza un nuovo rendering del
      // RootLayout sul server, che recupererà il nuovo utente/profilo
      // e li passerà verso il basso, garantendo la sincronizzazione tra client e server.
      // Questa è la chiave per risolvere il loop di login e l'errore UUID.
      if (session?.user?.id !== user?.id) {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, user])

  const logout = async () => {
    await supabase.auth.signOut()
    // Il listener onAuthStateChange attiverà router.refresh()
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
