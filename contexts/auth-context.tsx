"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"

// Uniamo il tipo User di Supabase con il nostro profilo custom
export type UserProfile = SupabaseUser & Profile

interface AuthContextType {
  user: UserProfile | null
  login: (data: any) => Promise<{ success: boolean; error?: string }>
  register: (data: any) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  supabase: SupabaseClient
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const handleSuccessfulLogin = (profile: Profile, sessionUser: SupabaseUser, event: string) => {
    const currentUser: UserProfile = { ...sessionUser, ...profile }
    setUser(currentUser)
    // Redirect solo al momento del login per evitare reindirizzamenti indesiderati
    if (event === "SIGNED_IN" && !pathname.startsWith("/dashboard") && !pathname.startsWith("/admin")) {
      switch (currentUser.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "operator":
          router.push("/dashboard/operator")
          break
        default:
          router.push("/dashboard/client")
          break
      }
    }
  }

  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      const sessionUser = session.user

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle()

      if (error) {
        console.error("AuthContext: Error fetching profile:", error)
        await supabase.auth.signOut()
        setUser(null)
      } else if (profile) {
        // Profilo trovato, procedi normalmente
        handleSuccessfulLogin(profile, sessionUser, event)
      } else {
        // *** SOLUZIONE AUTO-RIPARATIVA ***
        // Profilo non trovato, tentativo di crearlo al volo.
        console.warn(`AuthContext: Profile not found for user ${sessionUser.id}. Attempting to create one.`)
        const { error: insertError } = await supabase.from("profiles").insert({
          id: sessionUser.id,
          email: sessionUser.email,
          full_name: sessionUser.user_metadata?.full_name,
        })

        if (insertError) {
          console.error(
            `AuthContext: CRITICAL - Failed to create missing profile for user ${sessionUser.id}:`,
            insertError,
          )
          await supabase.auth.signOut()
          setUser(null)
        } else {
          // Profilo creato, riprova a leggerlo per continuare
          console.log(`AuthContext: Profile created for ${sessionUser.id}. Re-fetching.`)
          const { data: newProfile, error: refetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sessionUser.id)
            .single() // Ora deve esistere, quindi usiamo single()

          if (refetchError || !newProfile) {
            console.error(
              `AuthContext: CRITICAL - Failed to refetch newly created profile for ${sessionUser.id}:`,
              refetchError,
            )
            await supabase.auth.signOut()
            setUser(null)
          } else {
            handleSuccessfulLogin(newProfile, sessionUser, event)
          }
        }
      }
      setLoading(false)
    },
    [supabase, router, pathname],
  )

  useEffect(() => {
    // Esegui solo al primo caricamento
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      await handleAuthStateChange("INITIAL_SESSION", session)
    }
    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "USER_UPDATED" && event !== "INITIAL_SESSION") {
        handleAuthStateChange(event, session)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(data)
    setLoading(false)
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return { success: false, error: "Devi prima confermare la tua email. Controlla la tua casella di posta." }
      }
      return { success: false, error: "Credenziali non valide. Riprova." }
    }
    return { success: true }
  }

  const register = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    const { email, password, name, acceptTerms } = data
    if (!acceptTerms) {
      setLoading(false)
      return { success: false, error: "Devi accettare i termini e le condizioni." }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })
    setLoading(false)
    if (error) {
      if (error.message.includes("User already registered")) {
        return { success: false, error: "Un utente con questa email è già registrato." }
      }
      console.error("Registration error:", error)
      return { success: false, error: "Errore durante la registrazione. Riprova." }
    }
    router.push("/login?registration=success")
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    supabase,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider")
  }
  return context
}
