"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../utils/supabaseClient"

type AuthContextType = {
  session: Session | null
  profile: any | null // Replace 'any' with your profile type
  isLoading: boolean
  signIn: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null) // Replace 'any' with your profile type
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id)
    } else {
      setProfile(null)
      setIsLoading(false)
    }
  }, [session])

  const fetchProfile = async (userId: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        // This might happen if the profile is not created yet, which is not a critical error
        console.warn("Could not fetch profile:", error.message)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error: any) {
      console.error("Unexpected error fetching profile:", error.message)
      setProfile(null)
    } finally {
      setIsLoading(false) // This ensures loading is always turned off
    }
  }

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      alert("Check your email for the login link!")
    } catch (error: any) {
      alert(error.error_description || error.message)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error: any) {
      console.error("Error signing out:", error.message)
    }
  }

  const value: AuthContextType = {
    session,
    profile,
    isLoading,
    signIn,
    signOut,
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
