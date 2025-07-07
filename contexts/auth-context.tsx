"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js"

// Definiamo un'interfaccia per il nostro utente, che combina i dati di Supabase Auth
// con quelli della nostra tabella 'profiles'.
export interface UserProfile extends SupabaseUser {
  name: string
  role: "client" | "operator" | "admin"
  avatar_url: string | null
}

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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (profile) {
          const currentUser: UserProfile = { ...session.user, ...profile }
          setUser(currentUser)
          // Reindirizza solo al momento del login
          if (_event === "SIGNED_IN") {
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
        } else {
          // Se l'utente esiste in Auth ma non ha un profilo, lo slogghiamo per sicurezza
          // Potrebbe succedere se il profilo viene cancellato manualmente dal DB
          await supabase.auth.signOut()
          setUser(null)
          console.error("Profile not found for user:", session.user.id)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Funzione per caricare la sessione iniziale al caricamento della pagina
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        if (profile) {
          setUser({ ...session.user, ...profile })
        }
      }
      setLoading(false)
    }

    getInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const login = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(data)
    setLoading(false)
    if (error) {
      return { success: false, error: "Credenziali non valide. Riprova." }
    }
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
          name: name,
          role: role || "client",
        },
      },
    })
    setLoading(false)
    if (error) {
      if (error.message.includes("User already registered")) {
        return { success: false, error: "Un utente con questa email è già registrato." }
      }
      return { success: false, error: "Errore durante la registrazione. Riprova." }
    }
    // Reindirizzamento alla pagina di login dopo la registrazione
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
