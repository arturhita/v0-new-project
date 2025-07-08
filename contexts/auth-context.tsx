"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js"
import type { Database, Tables } from "@/types/database"
import { useToast } from "@/components/ui/use-toast"

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
  const { toast } = useToast()

  const fetchUserProfile = useCallback(
    async (sessionUser: SupabaseUser): Promise<UserProfile | null> => {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).single()

      if (error) {
        console.error("Errore nel recupero del profilo:", error.message)
        await supabase.auth.signOut()
        return null
      }
      return { ...sessionUser, ...profile }
    },
    [supabase],
  )

  useEffect(() => {
    const handleAuthChange = async (event: AuthChangeEvent, session: Session | null) => {
      setLoading(true)
      if (session?.user) {
        const fullUserProfile = await fetchUserProfile(session.user)
        setUser(fullUserProfile)

        if (event === "SIGNED_IN" && fullUserProfile) {
          toast({
            title: "Accesso effettuato",
            description: `Bentornato, ${fullUserProfile.full_name}!`,
          })
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
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange)

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
  }, [supabase, router, fetchUserProfile, toast])

  const login = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(data)
    setLoading(false)
    if (error) {
      return { success: false, error: "Credenziali non valide." }
    }
    return { success: true }
  }

  const register = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    const { email, password, name } = data

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: "client", // Registra sempre come 'client'
        },
      },
    })
    setLoading(false)
    if (error) {
      console.error("Register error:", error.message)
      if (error.message.includes("User already registered")) {
        return { success: false, error: "Un utente con questa email è già registrato." }
      }
      return { success: false, error: "Errore durante la registrazione. Riprova." }
    }
    toast({
      title: "Registrazione quasi completata!",
      description: "Controlla la tua email per confermare il tuo account.",
      variant: "default",
      duration: 10000,
    })
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
