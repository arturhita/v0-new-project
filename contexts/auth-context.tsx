"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

type UserProfile = {
  id: string
  name: string | null
  email: string | undefined
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

type AuthContextType = {
  user: UserProfile | null
  isAuthenticated: boolean
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, role")
          .eq("id", session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || null,
          avatar_url: profile?.avatar_url || null,
          role: profile?.role || "client",
        })
      }
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, role")
          .eq("id", session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || null,
          avatar_url: profile?.avatar_url || null,
          role: profile?.role || "client",
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, supabase.auth])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  const isAuthenticated = !!user

  return <AuthContext.Provider value={{ user, isAuthenticated, loading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
