"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { createSupabaseClient } from "@/lib/supabase/client"
import type { AuthContextType, UserProfile, RegisterCredentials, LoginCredentials } from "@/types/auth.types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createSupabaseClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async (sessionUser: User | null) => {
      if (sessionUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single()

        if (profile) {
          setUser({
            ...sessionUser,
            ...profile,
          })
          setIsAuthenticated(true)
        } else {
          // This case might happen if the profile creation fails, though the new trigger should prevent it.
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setLoading(false)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setLoading(true)
        await fetchUser(session?.user ?? null)
      }
    )

    // Initial check
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      await fetchUser(session?.user ?? null)
    }
    checkInitialSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const register = async ({ name, email, password }: RegisterCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })
    return { success: !error, user: data.user, error }
  }

  const login = async ({ email, password }: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { success: !error, user: data?.user, error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
