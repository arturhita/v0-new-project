"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User as SupabaseUser, AuthError } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

// Combine Supabase user with our custom profile data
export type UserProfile = SupabaseUser & {
  full_name: string
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
        console.error("Error fetching profile, signing out:", error.message)
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
      setLoading(true)
      if (session?.user) {
        const fullProfile = await fetchUserProfile(session.user)
        setUser(fullProfile)
        if (_event === "SIGNED_IN") {
          router.push("/dashboard/client") // Or role-based redirect
        }
      } else {
        setUser(null)
        router.push("/login")
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, fetchUserProfile])

  const login = async (data: any) => {
    const { error } = await supabase.auth.signInWithPassword(data)
    return { success: !error, error }
  }

  const register = async (data: any) => {
    const { name, email, password } = data
    // The new database trigger will use this metadata.
    const { data: result, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: "client", // Default role
        },
      },
    })

    if (!error && result.user) {
      toast({
        title: "Registrazione quasi completata!",
        description: "Controlla la tua email per confermare il tuo account.",
      })
    }
    return { success: !error, error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
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
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
