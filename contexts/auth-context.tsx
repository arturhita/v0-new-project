"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User } from "@supabase/supabase-js"

export type Profile = {
  id: string
  role: "admin" | "operator" | "client"
  full_name: string | null
  stage_name?: string | null
  email?: string | null
  phone_number?: string | null
  bio?: string | null
  profile_image_url?: string | null // FIX: Changed avatar_url to profile_image_url
  specializations?: string[] | null
  is_available?: boolean | null
  commission_rate?: number | null
  service_prices?: { [key: string]: number | null } | null
  availability_schedule?: any | null
  average_rating?: number | null
  review_count?: number | null
  created_at?: string
  // Aggiungi qui altri campi specifici del profilo se necessario
}

type AuthContextType = {
  supabase: SupabaseClient
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (email: string, pass: string) => Promise<any>
  logout: () => Promise<void>
  register: (email: string, pass: string, fullName: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(userProfile)
      }
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, pass: string) => {
    return supabase.auth.signInWithPassword({ email, password: pass })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const register = async (email: string, pass: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) return { user: null, error }

    // Inserisci il profilo dopo la registrazione
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: "client",
      })
      if (profileError) {
        // Potresti voler gestire questo errore, ad esempio eliminando l'utente auth appena creato
        console.error("Error creating profile:", profileError)
        return { user: null, error: profileError }
      }
    }
    return { user: data.user, error: null }
  }

  return (
    <AuthContext.Provider value={{ supabase, user, profile, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
