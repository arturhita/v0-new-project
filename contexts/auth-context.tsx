"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>
  register: (credentials: any) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error: { message: string } | null }>
  resetPassword: (password: string) => Promise<{ error: { message: string } | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (_event === "PASSWORD_RECOVERY") {
        router.push("/reset-password")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const login = async (credentials: any) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(credentials)
    setLoading(false)
    if (error) {
      return { success: false, error: error.message }
    }
    router.push("/") // Redirect to homepage or dashboard
    return { success: true }
  }

  const register = async (credentials: any) => {
    setLoading(true)
    const { email, password, ...rest } = credentials
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...rest,
          role: "client", // Default role
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    setLoading(false)
    if (error) {
      return { success: false, error: error.message }
    }
    if (user) {
      toast.success("Registrazione quasi completata!", {
        description: "Ti abbiamo inviato un'email di conferma. Clicca sul link per attivare il tuo account.",
      })
    }
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    })
    return { error }
  }

  const resetPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
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
