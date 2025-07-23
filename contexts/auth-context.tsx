"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

// Definizione dei tipi per il profilo e il contesto
interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
  // Aggiungere altri campi del profilo se necessario
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

  // Inizializza lo stato con i dati forniti dal server (da app/layout.tsx)
  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState(initialProfile)
  // isLoading è true solo all'inizio, finché non abbiamo la certezza dello stato
  const [isLoading, setIsLoading] = useState(initialUser === undefined)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Non è necessario un redirect qui, l'evento SIGNED_OUT lo gestirà
  }, [supabase.auth])

  useEffect(() => {
    // Questo listener reagisce ai cambiamenti di stato di autenticazione nel client
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Se l'utente è loggato, recupera il suo profilo
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()
        setProfile(userProfile as Profile)
      } else {
        // Se l'utente non è loggato, pulisce il profilo
        setProfile(null)
        router.push("/login") // Reindirizza al login se l'utente si scollega
      }
      setIsLoading(false)
    })

    // Pulisce il listener quando il componente viene smontato
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Se i dati iniziali dal server cambiano, aggiorna lo stato
  useEffect(() => {
    setUser(initialUser)
    setProfile(initialProfile)
    setIsLoading(initialUser === undefined)
  }, [initialUser, initialProfile])

  // Mostra uno spinner di caricamento a schermo intero mentre si verifica lo stato di autenticazione
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

// Hook personalizzato per accedere facilmente al contesto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
