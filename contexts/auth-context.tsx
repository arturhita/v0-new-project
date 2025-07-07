"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  login: (email: string, pass: string) => Promise<void>
  register: (email: string, pass: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        setLoading(false)
        if (event === "SIGNED_IN") {
          router.push("/")
        }
        if (event === "SIGNED_OUT") {
          router.push("/")
        }
      },
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, router])

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Login effettuato con successo!")
      router.push("/")
    }
  }

  const register = async (email: string, pass: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          role: "client", // Default role for new users
        },
      },
    })
    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      toast.success("Registrazione completata! Controlla la tua email per la conferma.")
      router.push("/login")
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast.info("Sei stato disconnesso.")
    router.push("/")
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
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
