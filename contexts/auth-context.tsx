"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, SupabaseClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

// Definiamo un tipo per il profilo che corrisponde alla tabella DB
interface Profile {
  id: string
  role: "client" | "operator" | "admin"
  full_name: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
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
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(
    async (userToFetch: User | null) => {
      if (!userToFetch) {
        setProfile(null)
        return null
      }
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userToFetch.id).single()
        if (error) throw error
        setProfile(data as Profile)
        return data as Profile
      } catch (error) {
        console.error("Error fetching profile:", error)
        setProfile(null)
        return null
      }
    },
    [supabase],
  )

  useEffect(() => {
    setLoading(true)
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await fetchProfile(currentUser)
      setLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      const currentProfile = await fetchProfile(currentUser)

      if (_event === "SIGNED_IN" && currentProfile) {
        switch (currentProfile.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "operator":
            router.push("/dashboard/operator")
            break
          case "client":
            router.push("/dashboard/client")
            break
          default:
            router.push("/")
        }
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile, supabase, router])

  const login = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(data)
    setLoading(false)
    if (error) {
      return { success: false, error: error.message }
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
          full_name: name, // Il trigger DB si aspetta `full_name`
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
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/")
    setLoading(false)
  }

  const value: AuthContextType = {
    user,
    profile,
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
