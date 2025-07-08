"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User as SupabaseUser, AuthError } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"

export type UserProfile = SupabaseUser & {
  name: string | null
  role: "client" | "operator" | "admin"
  avatar_url: string | null
}

interface AuthContextType {
  user: UserProfile | null
  login: (data: any) => Promise<{ success: boolean; error?: AuthError | null }>
  register: (data: any) => Promise<{ success: boolean; error?: AuthError | null }>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  supabase: SupabaseClient
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const fetchUserProfile = useCallback(
    async (sessionUser: SupabaseUser): Promise<UserProfile | null> => {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).single()
      if (error) {
        console.error("Errore nel recuperare il profilo, logout in corso:", error.message)
        await supabase.auth.signOut()
        return null
      }
      return { ...sessionUser, ...profile } as UserProfile
    },
    [supabase],
  )

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const fullProfile = await fetchUserProfile(session.user)
        setUser(fullProfile)
      }
      setLoading(false)
      setIsInitialLoad(false)
    }
    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === "SIGNED_OUT") {
        setUser(null)
        return
      }
      if (session?.user) {
        const fullProfile = await fetchUserProfile(session.user)
        setUser(fullProfile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchUserProfile])

  const login = async (data: any) => {
    setLoading(true)
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword(data)

    if (signInError) {
      setLoading(false)
      return { success: false, error: signInError }
    }

    if (sessionData.user) {
      const fullProfile = await fetchUserProfile(sessionData.user)

      if (fullProfile) {
        setUser(fullProfile)
        switch (fullProfile.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "operator":
            router.push("/dashboard/operator")
            break
          case "client":
            router.push("/dashboard/client")
            break
          default:
            router.push("/")
            break
        }
        setLoading(false)
        return { success: true, error: null }
      } else {
        setLoading(false)
        return {
          success: false,
          error: {
            name: "ProfileNotFound",
            message: "Login riuscito, ma non è stato possibile caricare il profilo utente. Contattare l'assistenza.",
          } as AuthError,
        }
      }
    }
    setLoading(false)
    return {
      success: false,
      error: { name: "UnknownLoginError", message: "Si è verificato un errore sconosciuto." } as AuthError,
    }
  }

  const register = async (data: any) => {
    const { name, email, password } = data
    const { data: result, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: "client",
        },
      },
    })

    if (!error && result.user) {
      toast({
        title: "Registrazione quasi completata!",
        description: "Controlla la tua email per confermare il tuo account.",
      })
    }
    return { success: !error, error: error || null }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Protezione delle rotte
  useEffect(() => {
    if (isInitialLoad) return // Non fare nulla finché il caricamento iniziale non è completo

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isAdminPage = pathname.startsWith("/admin")
    const isOperatorDashboard = pathname.startsWith("/dashboard/operator")
    const isClientDashboard = pathname.startsWith("/dashboard/client")

    if (!loading && !user && !isAuthPage) {
      router.push("/login")
      return
    }

    if (!loading && user && user) {
      const profile = user
      if (isAuthPage) {
        // Se l'utente è loggato e prova ad accedere a login/register, reindirizza
        if (profile.role === "admin") router.push("/admin/dashboard")
        else if (profile.role === "operator") router.push("/dashboard/operator")
        else router.push("/dashboard/client")
      } else if (isAdminPage && profile.role !== "admin") {
        router.push("/") // O una pagina di "accesso negato"
      } else if (isOperatorDashboard && profile.role !== "operator") {
        router.push("/")
      }
    }
  }, [user, loading, pathname, router, isInitialLoad])

  const value = {
    supabase,
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  }

  if (isInitialLoad) {
    return <LoadingSpinner />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider")
  }
  return context
}
