"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User, Session } from "@supabase/supabase-js"
import { LoadingSpinner } from "@/components/loading-spinner"

type Profile = {
  id: string
  role: "admin" | "operator" | "client"
  stage_name?: string
  full_name?: string
  avatar_url?: string
}

type AuthContextType = {
  supabase: SupabaseClient
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<{
    success: boolean
    error: { message: string } | null
  }>
  register: (credentials: { name: string; email: string; password: string }) => Promise<{
    success: boolean
    error: { message: string } | null
  }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          console.error("Error fetching profile on auth change:", error)
          setProfile(null)
        } else {
          setProfile(userProfile)
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    // Esegui un controllo iniziale per la sessione esistente al caricamento
    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()
        if (!error) setProfile(userProfile)
      }
      setIsLoading(false)
    }

    checkInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const login = async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { success: false, error: { message: error.message } }
    }
    if (data.user) {
      const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      if (userProfile) {
        switch (userProfile.role) {
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
      } else {
        router.push("/") // Fallback
      }
    }
    return { success: true, error: null }
  }

  const register = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: "client",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      return { success: false, error: { message: error.message } }
    }
    return { success: true, error: null }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const value = { supabase, user, profile, session, isLoading, login, register, logout }

  // Mostra lo spinner solo al caricamento iniziale, non durante la navigazione
  if (isLoading && !user) {
    return <LoadingSpinner fullScreen={true} />
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
