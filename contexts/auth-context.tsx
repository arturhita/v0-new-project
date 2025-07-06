"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
// Importiamo direttamente l'istanza singleton
import supabase from "@/lib/supabase/client"
import type { User, AuthError } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export type Profile = {
  id: string
  updated_at: string | null
  role: "client" | "operator" | "admin"
  name: string | null
  nickname: string | null
  avatar_url: string | null
  bio: string | null
  specialties: string[] | null
  is_online: boolean
  wallet_balance: number
  operator_rate_per_minute: number | null
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  login: (credentials: any) => Promise<{ success: boolean; error: AuthError | null }>
  register: (credentials: any) => Promise<{ success: boolean; error: AuthError | null }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle()
        setProfile(userProfile ? (userProfile as Profile) : null)

        if (event === "SIGNED_IN" && userProfile) {
          switch ((userProfile as Profile).role) {
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

    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle()
        setProfile(userProfile ? (userProfile as Profile) : null)
      }
      setLoading(false)
    }
    getInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const login = async (credentials: any) => {
    const { error } = await supabase.auth.signInWithPassword(credentials)
    return { success: !error, error }
  }

  const register = async (credentials: any) => {
    const { email, password, name, role } = credentials
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })
    return { success: !error, error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const value = {
    user,
    profile,
    login,
    register,
    logout,
    loading,
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
