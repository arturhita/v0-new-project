"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Il listener onAuthStateChange gestirà il reindirizzamento
  }, [supabase.auth])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null

      if (currentUser) {
        // L'utente è loggato, recupera il suo profilo
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          // Se il profilo non esiste o c'è un errore, è uno stato anomalo.
          // Disconnetti l'utente per evitare che rimanga bloccato.
          console.error("Errore nel recupero del profilo, logout in corso:", error)
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        } else {
          // Recupero di utente e profilo avvenuto con successo
          setUser(currentUser)
          setProfile(userProfile as Profile | null)
        }
      } else {
        // L'utente è disconnesso
        setUser(null)
        setProfile(null)
      }

      // Ora abbiamo uno stato definitivo, interrompi il caricamento
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    // Questo effetto gestisce i reindirizzamenti in base allo stato di autenticazione
    if (isLoading) {
      return // Non fare nulla mentre si controlla l'autenticazione
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!user && isProtectedPage) {
      // Non loggato e su una pagina protetta -> reindirizza al login
      router.replace("/login")
      return
    }

    if (user && profile && isAuthPage) {
      // Loggato e su una pagina di autenticazione -> reindirizza alla dashboard corretta
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  // Mostra uno spinner a schermo intero durante il controllo iniziale dell'autenticazione
  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

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
