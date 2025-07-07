"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session, User } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"
import { useRouter } from "next/navigation"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient<Database>()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (event === "SIGNED_IN" && session?.user) {
        const { data: userProfile, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (error) {
          console.error("Error fetching user profile:", error)
        } else {
          setProfile(userProfile)
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, supabase.auth])

  useEffect(() => {
    if (session?.user && !profile && !loading) {
      const fetchProfile = async () => {
        const { data: userProfile, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (error) {
          console.error("Error fetching user profile on load:", error)
        } else {
          setProfile(userProfile)
        }
      }
      fetchProfile()
    }
  }, [session, profile, loading, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
