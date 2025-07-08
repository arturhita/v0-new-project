"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js"
import type { Database, Tables } from "@/types/database"

// Un tipo composito per avere sempre a disposizione i dati del profilo insieme a quelli dell'utente
export type UserProfile = SupabaseUser & Tables<"profiles">

interface AuthContextType {
  user: UserProfile | null
  login: (data: any) => Promise<{ success: boolean; error?: string }>
  register: (data: any) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  supabase: SupabaseClient<Database>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUserProfile = useCallback(
    async (sessionUser: SupabaseUser): Promise<UserProfile | null> => {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).single()

      if (error) {
        console.error("Errore nel recupero del profilo:", error.message)
        // Se non troviamo il profilo, forziamo il logout per evitare stati inconsistenti
        await supabase.auth.signOut()
        return null
      }
      // Uniamo i dati di auth.user e public.profiles
      return { ...sessionUser, ...profile }
    },
    [supabase],
  )

  useEffect(() => {
    setLoading(true)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        const fullUserProfile = await fetchUserProfile(session.user)
        setUser(fullUserProfile)

        if (event === "SIGNED_IN" && fullUserProfile) {
          switch (fullUserProfile.role) {
            case "admin":
              router.push("/admin/dashboard")
              break
            case "operator":
              router.push("/dashboard/operator")
              break
            default:
              router.push("/dashboard/client")
          }
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Controlla la sessione iniziale al caricamento dell'app
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const fullUserProfile = await fetchUserProfile(session.user)
        setUser(fullUserProfile)
      }
      setLoading(false)
    }

    getInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, fetchUserProfile])

  const login = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(data)
    setLoading(false)
    if (error) {
      return { success: false, error: "Credenziali non valide." }
    }
    // Il redirect è gestito da onAuthStateChange
    return { success: true }
  }

  const register = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    const { email, password, name, role, acceptTerms } = data
    if (!acceptTerms) {
      setLoading(false)
      return { success: false, error: "Devi accettare i termini e le condizioni." }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || "client",
        },
      },
    })
    setLoading(false)
    if (error) {
      console.error("Register error:", error.message)
      return { success: false, error: error.message }
    }
    alert("Registrazione avvenuta con successo! Controlla la tua email per confermare l'account.")
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
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
