"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database.types"
import { logout as logoutAction } from "@/lib/actions/auth.actions"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
})

type AuthProviderProps = {
  children: React.ReactNode
  serverSession: Session | null
  serverProfile: Profile | null
}

export const AuthProvider = ({ children, serverSession, serverProfile }: AuthProviderProps) => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(serverSession?.user ?? null)
  const [profile, setProfile] = useState<Profile | null>(serverProfile)
  const [loading, setLoading] = useState(false) // Iniziamo con false perché i dati arrivano dal server

  const logout = useCallback(async () => {
    await logoutAction()
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(newProfile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = {
    user,
    profile,
    loading,
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
