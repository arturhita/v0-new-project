"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { User, UserRole } from "@/types/user.types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase: SupabaseClient = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)
      if (session?.user) {
        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (error) {
          console.error("Error fetching profile:", error)
          setUser(null)
        } else if (profile) {
          const currentUser: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            role: profile.role,
            avatar_url: profile.avatar_url,
          }
          setUser(currentUser)

          // Redirect on login
          if (event === "SIGNED_IN") {
            switch (profile.role) {
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
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Check for initial session on app load
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            role: profile.role,
            avatar_url: profile.avatar_url,
          })
        }
      }
      setLoading(false)
    }
    getInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    // The onAuthStateChange listener will handle the redirect
  }

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // We store the name and role in the user_metadata, which will be used by our trigger
        // to create the public profile in the `profiles` table.
        data: {
          name: name,
          role: role,
        },
      },
    })
    if (error) throw new Error(error.message)
    // The onAuthStateChange listener will handle the user state, but we don't redirect here.
    // We show a success message on the registration page.
    return data.user
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
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
