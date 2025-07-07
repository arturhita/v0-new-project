"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js"
import type { Database, Tables } from "@/types/database"

// Uniamo l'utente Supabase con il nostro profilo custom
export type UserProfile = SupabaseUser & Tables<"profiles"> & { operator_details: Tables<"operator_details"> | null }

interface AuthContextType {
  user: UserProfile | null
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>
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

  useEffect(() => {
    const fetchUser = async (sessionUser: SupabaseUser): Promise<UserProfile | null> => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*, operator_details(*)")
        .eq("id", sessionUser.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error.message)
        await supabase.auth.signOut()
        return null
      }

      if (profile) {
        const operatorDetails = Array.isArray(profile.operator_details)
          ? (profile.operator_details[0] ?? null)
          : profile.operator_details

        return {
          ...sessionUser,
          ...profile,
          operator_details: operatorDetails,
        } as UserProfile
      }
      return null
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)
      if (session?.user) {
        const fullUser = await fetchUser(session.user)
        setUser(fullUser)
        if (_event === "SIGNED_IN" && fullUser) {
          switch (fullUser.role) {
            case "admin":
              router.push("/admin/dashboard")
              break
            case "operator":
              router.push("/dashboard/operator")
              break
            default:
              router.push("/")
          }
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    const getInitialSession = async () => {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const fullUser = await fetchUser(session.user)
        setUser(fullUser)
      }
      setLoading(false)
    }
    getInitialSession()

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const login = async (credentials: { email: string; password: string }): Promise<{
    success: boolean
    error?: string
  }> => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(credentials)
    setLoading(false)
    if (error) {
      console.error("Login error:", error)
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
          role: role || "client",
        },
      },
    })
    setLoading(false)
    if (error) {
      console.error("Register error:", error)
      return { success: false, error: error.message }
    }
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
    throw new Error("useAuth deve essere usato all'interno di AuthProvider")
  }
  return context
}
