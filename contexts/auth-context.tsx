"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export interface UserProfile {
  id: string
  email: string | undefined
  name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  register: (email: string, password: string, name: string) => Promise<any>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const fetchUserProfile = useCallback(
    async (supabaseUser: SupabaseUser): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, role")
        .eq("id", supabaseUser.id)
        .single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      return {
        id: data.id,
        email: supabaseUser.email,
        name: data.name,
        avatar_url: data.avatar_url,
        role: data.role as UserProfile["role"],
      }
    },
    [supabase],
  )

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await fetchUserProfile(session.user)
        setUser(profile)
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user)
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile])

  const login = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      return { error }
    }
    if (data.user) {
      const profile = await fetchUserProfile(data.user)
      setUser(profile)
      setLoading(false)
      return { user: profile }
    }
    setLoading(false)
    return { error: { message: "Login failed unexpectedly." } }
  }

  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })
    if (error) {
      setLoading(false)
      return { error }
    }
    if (data.user) {
      const profile = await fetchUserProfile(data.user)
      setUser(profile)
      setLoading(false)
      return { user: profile }
    }
    setLoading(false)
    return { error: { message: "Registration failed unexpectedly." } }
  }

  const logout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
    router.push("/") // Redirect to home on logout
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
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
