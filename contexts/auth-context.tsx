"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/database"
import LoadingSpinner from "@/components/loading-spinner" // Assumendo che esista un componente per lo spinner

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const getProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error) {
        console.error("Errore nel caricamento del profilo:", error.message)
        return null
      }
      return data
    },
    [supabase],
  )

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

      if (loginError) {
        return { success: false, message: "Credenziali non valide. Riprova." }
      }

      if (!loginData.user) {
        return { success: false, message: "Login fallito, utente non trovato." }
      }

      // Flusso unificato: carica il profilo subito dopo il login
      const userProfile = await getProfile(loginData.user.id)

      if (!userProfile) {
        // Se il profilo non esiste, è un errore critico. Esegui il logout.
        await supabase.auth.signOut()
        return { success: false, message: "Errore: profilo utente non trovato. Contattare l'assistenza." }
      }

      // Imposta tutto insieme
      setUser(loginData.user)
      setSession(loginData.session)
      setProfile(userProfile)

      // Reindirizzamento basato sul ruolo
      if (userProfile.role === "admin") {
        router.push("/admin/dashboard")
      } else if (userProfile.role === "operator") {
        router.push("/operator/dashboard")
      } else {
        router.push("/dashboard/client")
      }

      return { success: true, message: "Login effettuato con successo!" }
    } catch (error) {
      console.error("Errore imprevisto durante il login:", error)
      return { success: false, message: "Si è verificato un errore imprevisto." }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    router.push("/login")
    setIsLoading(false)
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true)
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const userProfile = await getProfile(currentUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
      if (isInitialLoad) setIsInitialLoad(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, getProfile, isInitialLoad])

  // Protezione delle rotte
  useEffect(() => {
    if (isInitialLoad) return // Non fare nulla finché il caricamento iniziale non è completo

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isAdminPage = pathname.startsWith("/admin")
    const isOperatorPage = pathname.startsWith("/operator")
    const isClientDashboard = pathname.startsWith("/dashboard/client")

    if (!isLoading && !user && !isAuthPage) {
      router.push("/login")
      return
    }

    if (!isLoading && user && profile) {
      if (isAuthPage) {
        // Se l'utente è loggato e prova ad accedere a login/register, reindirizza
        if (profile.role === "admin") router.push("/admin/dashboard")
        else if (profile.role === "operator") router.push("/operator/dashboard")
        else router.push("/dashboard/client")
      } else if (isAdminPage && profile.role !== "admin") {
        router.push("/") // O una pagina di "accesso negato"
      } else if (isOperatorPage && profile.role !== "operator") {
        router.push("/")
      } else if (isClientDashboard && profile.role !== "client") {
        router.push("/")
      }
    }
  }, [user, profile, isLoading, pathname, router, isInitialLoad])

  if (isInitialLoad) {
    return <LoadingSpinner /> // Mostra uno spinner a schermo intero durante il primo caricamento
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, login, logout }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider")
  }
  return context
}
