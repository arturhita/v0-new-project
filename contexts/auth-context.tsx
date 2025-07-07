"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"
import type { Database } from "@/types/database" // Declare the Database variable

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (email: string, pass: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
    if (error) {
      console.error("Error fetching profile:", error.message)
      return null
    }
    return data
  }

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const userProfile = await fetchProfile(session.user.id)
        setProfile(userProfile)
      }
      setIsLoading(false)
    }

    getSessionAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id)
        setProfile(userProfile)
        // Redirect after login/register based on role
        if (event === "SIGNED_IN") {
          switch (userProfile?.role) {
            case "admin":
              router.push("/admin/dashboard")
              break
            case "operator":
              router.push("/dashboard/operator")
              break
            default:
              router.push("/dashboard/client")
              break
          }
        }
      } else {
        setProfile(null)
        if (event === "SIGNED_OUT") {
          router.push("/login")
        }
      }
      setIsLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, router])

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) throw error
    // Redirect is handled by onAuthStateChange
  }

  const register = async (email: string, pass: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
    // Redirect is handled by onAuthStateChange
  }

  const logout = async () => {
    await supabase.auth.signOut()
    // Redirect is handled by onAuthStateChange
  }

  const value = { user, profile, isLoading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
