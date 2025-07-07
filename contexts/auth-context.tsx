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

  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      setLoading(true)
      if (session?.user) {
        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single() // Ora possiamo usare single() perché il DB è garantito essere consistente

        if (error || !profile) {
          // Questo caso non dovrebbe più accadere, ma lo teniamo come salvaguardia.
          console.error("AuthContext: CRITICAL - Profile not found for authenticated user. Signing out.", error)
          await supabase.auth.signOut()
          setUser(null)
        } else {
          const currentUser: UserProfile = { ...session.user, ...profile }
          setUser(currentUser)
          // Redirect solo al momento del login esplicito per evitare navigazioni indesiderate
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
      } else {
        setUser(null)
      }
      setLoading(false)
    },
    [supabase, router, pathname],
  )

  useEffect(() => {
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
      if (event !== "USER_UPDATED") {
        handleAuthStateChange(event, session)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [handleAuthStateChange, supabase.auth])

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
