"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

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
  isLoading: boolean
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
  // Lo stato di caricamento è attivo solo se i dati iniziali non sono disponibili.
  const [isLoading, setIsLoading] = useState(initialUser === null && typeof window !== "undefined")

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Il listener onAuthStateChange gestirà il reindirizzamento.
  }, [supabase.auth])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // Se l'utente effettua il login (es. in un'altra scheda), ricarica per sincronizzare lo stato del server.
        router.refresh()
      } else if (event === "SIGNED_OUT") {
        // Se l'utente si disconnette, pulisce lo stato client e reindirizza al login.
        setUser(null)
        setProfile(null)
        router.push("/login")
      }
      setIsLoading(false)
    })

    // Se non abbiamo ricevuto dati dal server, facciamo un controllo finale sul client.
    if (isLoading) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setIsLoading(false)
        }
      })
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, isLoading])

  // Sincronizza lo stato se le props del server cambiano (durante la navigazione).
  useEffect(() => {
    setUser(initialUser)
    setProfile(initialProfile)
  }, [initialUser, initialProfile])

  // Mostra uno spinner solo durante il caricamento iniziale sul client.
  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
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
