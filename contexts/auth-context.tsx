"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { Profile, UserRole } from "@/types/user.types"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<{ success: boolean; error?: any }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase: SupabaseClient = createClient()
  const router = useRouter()

  useEffect(() => {
    const getInitialUser = async () => {
      const {
        data: { user: initialUser },
      } = await supabase.auth.getUser()
      if (initialUser) {
        setUser(initialUser)
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", initialUser.id).single()
        setProfile(userProfile as Profile)
      }
      setLoading(false)
    }

    getInitialUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()
        setProfile(userProfile as Profile)

        if (event === "SIGNED_IN") {
          switch (userProfile?.role) {
            case "admin":
              router.push("/admin/dashboard")
              break
            case "operator":
              router.push("/dashboard/operator")
              break
            case "client":
            default:
              router.push("/dashboard/client")
              break
          }
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { success: !error, error }
  }

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })
    return { success: !error, error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
