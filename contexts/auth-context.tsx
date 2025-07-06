"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import type { Profile } from "@/types/user.types"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const fetchUserProfile = useCallback(
    async (user: User | null) => {
      if (!user) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(user)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        setProfile(null)
      } else {
        setProfile(data as Profile)
      }
      setLoading(false)
    },
    [supabase],
  )

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setLoading(true)
      fetchUserProfile(session?.user ?? null)
    })

    // Fetch initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        fetchUserProfile(session?.user ?? null)
      })
      .catch((err) => {
        console.error("Error getting initial session:", err)
        setLoading(false)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, fetchUserProfile])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/")
  }

  const value = {
    user,
    profile,
    loading,
    logout,
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
