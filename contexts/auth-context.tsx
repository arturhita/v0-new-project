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
  const [isLoading, setIsLoading] = useState(true) // Inizia come true

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Il listener onAuthStateChange gestirà il reindirizzamento
  }, [supabase.auth])

  useEffect(() => {
    // Questo effetto viene eseguito una volta al montaggio per impostare il listener di autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Se l'utente è loggato, recupera il suo profilo
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("id", currentUser.id)
          .single()
        setProfile(userProfile as Profile | null)
      } else {
        // Se l'utente è sloggato, pulisce il profilo
        setProfile(null)
      }

      // Interrompe il caricamento solo dopo aver ottenuto lo stato di autenticazione definitivo
      setIsLoading(false)
    })

    return () => {
      // Pulisce la sottoscrizione allo smontaggio
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    // Questo effetto gestisce la logica di reindirizzamento in base allo stato di autenticazione
    if (isLoading) {
      return // Non fare nulla mentre stiamo ancora determinando lo stato di autenticazione
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!user && isProtectedPage) {
      // Se l'utente non è loggato e tenta di accedere a una pagina protetta,
      // reindirizzalo alla pagina di login.
      router.replace("/login")
    }

    if (user && profile && isAuthPage) {
      // Se l'utente è loggato e si trova su una pagina di login/registrazione,
      // reindirizzalo alla sua dashboard corretta.
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  // Mostra uno spinner a schermo intero durante il controllo iniziale dell'autenticazione per evitare sfarfallii
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
