"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (credentials: {
    email: string
    password: string
    name: string
    role: "client" | "operator"
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const fetchUser = useCallback(
    async (currentUser: User | null) => {
      if (currentUser) {
        console.log("Fetching profile for user:", currentUser.id)
        try {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single()

          if (error) {
            console.error("Error fetching profile:", error.message)
            throw error
          }

          console.log("Profile fetched successfully:", profileData)
          setProfile(profileData)
          setUser(currentUser)
        } catch (error) {
          console.error("Caught an error in fetchUser:", error)
          // In case of error, logout to clear state
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    },
    [supabase],
  )

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      await fetchUser(session?.user ?? null)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", event)
        await fetchUser(session?.user ?? null)
        if (event === "SIGNED_IN") {
          const userRole = session?.user?.user_metadata?.role || profile?.role
          if (userRole === "admin") {
            router.push("/admin/dashboard")
          } else if (userRole === "operator") {
            router.push("/dashboard/operator")
          } else {
            router.push("/dashboard/client")
          }
        } else if (event === "SIGNED_OUT") {
          if (!["/login", "/register", "/forgot-password", "/update-password"].includes(pathname)) {
            router.push("/")
          }
        }
      },
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchUser, supabase.auth, router, pathname, profile?.role])

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(credentials)
    if (error) {
      console.error("Login error:", error.message)
      alert(`Errore di accesso: ${error.message}`)
    }
    // The onAuthStateChange listener will handle redirection
    setLoading(false)
  }

  const register = async (credentials: {
    email: string
    password: string
    name: string
    role: "client" | "operator"
  }) => {
    setLoading(true)
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
    if (error) {
      console.error("Registration error:", error.message)
      alert(`Errore di registrazione: ${error.message}`)
    } else {
      alert("Registrazione avvenuta con successo! Controlla la tua email per confermare l'account.")
      router.push("/login")
    }
    setLoading(false)
  }

  const logout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setLoading(false)
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
