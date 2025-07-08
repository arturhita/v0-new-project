"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User as SupabaseUser, AuthError } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

export type UserProfile = SupabaseUser & {
  name: string | null
  role: "client" | "operator" | "admin"
  avatar_url: string | null
}

interface AuthContextType {
  user: UserProfile | null
  login: (data: any) => Promise<{ success: boolean; error?: AuthError | null }>
  register: (data: any) => Promise<{ success: boolean; error?: AuthError | null }>
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
  const { toast } = useToast()

  const fetchUserProfile = useCallback(
    async (sessionUser: SupabaseUser): Promise<UserProfile | null> => {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).single()
      if (error) {
        console.error("Errore nel recuperare il profilo, logout in corso:", error.message)
        await supabase.auth.signOut()
        return null
      }
      return { ...sessionUser, ...profile } as UserProfile
    },
    [supabase],
  )

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const fullProfile = await fetchUserProfile(session.user)
        setUser(fullProfile)
      }
      setLoading(false)
    }
    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const fullProfile = await fetchUserProfile(session.user)
        setUser(fullProfile)
        if (_event === "SIGNED_IN" && fullProfile) {
          switch (fullProfile.role) {
            case "admin":
              router.push("/admin")
              break
            case "operator":
              router.push("/dashboard/operator")
              break
            case "client":
              router.push("/dashboard/client")
              break
            default:
              router.push("/")
              break
          }
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, fetchUserProfile])

  const login = async (data: any) => {
    const { error } = await supabase.auth.signInWithPassword(data)
    return { success: !error, error: error || null }
  }

  const register = async (data: any) => {
    const { name, email, password } = data
    const { data: result, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: "client",
        },
      },
    })

    if (!error && result.user) {
      toast({
        title: "Registrazione quasi completata!",
        description: "Controlla la tua email per confermare il tuo account.",
      })
    }
    return { success: !error, error: error || null }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const value = {
    supabase,
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider")
  }
  return context
}
