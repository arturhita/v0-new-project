"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import type { Profile, UserRole } from "@/types/user.types"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
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
    } = supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
      setLoading(true)
      await fetchUserProfile(session?.user ?? null)

      if (event === "SIGNED_IN" && session?.user) {
        const { data: profileData } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
        if (profileData) {
          switch (profileData.role) {
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
      }
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
  }, [supabase, fetchUserProfile, router])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // onAuthStateChange will handle the redirect and user state
  }

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: role,
        },
      },
    })
    if (error) throw error
    // onAuthStateChange will handle the user state.
  }

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
    login,
    register,
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
