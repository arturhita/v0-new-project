"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

// Definiamo un tipo per il profilo che corrisponde alla tabella DB
interface Profile {
  id: string
  role: "client" | "operator" | "admin"
  full_name: string
  avatar_url?: string
  // Aggiungi altri campi del profilo se necessario
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  logout: () => Promise<void>
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
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      await fetchProfile(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      await fetchProfile(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile, supabase.auth])

  const logout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push("/")
  }

  const value = { user, profile, loading, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
