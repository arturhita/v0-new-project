"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile, SupabaseClientType } from "@/types/database"

interface AuthContextType {
  user: UserProfile | null
  login: (data: any) => Promise<{ success: boolean; error?: string }>
  register: (data: any) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  supabase: SupabaseClientType
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase: SupabaseClientType = createClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*, operator_details(*)")
          .eq("id", session.user.id)
          .single()

        if (profile) {
          const currentUser: UserProfile = {
            ...session.user,
            ...profile,
            operator_details: Array.isArray(profile.operator_details) ? profile.operator_details[0] : undefined,
          }
          setUser(currentUser)
          if (_event === "SIGNED_IN") {
            switch (currentUser.role) {
              case "admin":
                router.push("/admin/dashboard")
                break
              case "operator":
                router.push("/dashboard/operator")
                break
              case "client":
                router.push("/")
                break
              default:
                router.push("/")
            }
          }
        } else {
          setUser(null)
          console.error("Profile not found for user:", session.user.id, "Error:", error?.message)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*, operator_details(*)")
          .eq("id", session.user.id)
          .single()
        if (profile) {
          setUser({
            ...session.user,
            ...profile,
            operator_details: Array.isArray(profile.operator_details) ? profile.operator_details[0] : undefined,
          })
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
      return { success: false, error: "Credenziali non valide." }
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
          name,
          email,
          role: role || "client",
        },
      },
    })
    setLoading(false)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
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
    throw new Error("useAuth deve essere usato all'interno di AuthProvider")
  }
  return context
}
