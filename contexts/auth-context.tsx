"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }, [router, supabase.auth])

  useEffect(() => {
    // Funzione per controllare la sessione e caricare il profilo
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("id", session.user.id)
          .single()
        setProfile(userProfile as Profile | null)
      }
      setIsLoading(false)
    }

    checkUser()

    // Listener per i cambiamenti di stato (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          supabase
            .from("profiles")
            .select("id, full_name, avatar_url, role")
            .eq("id", currentUser.id)
            .single()
            .then(({ data }) => setProfile(data as Profile | null))
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    // La logica di reindirizzamento viene eseguita solo quando il caricamento è terminato
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    // Utente non loggato su pagina protetta
    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    // Utente loggato su pagina di login/registrazione
    if (user && profile && isAuthPage) {
      const targetDashboard =
        profile.role === "admin"
          ? "/admin/dashboard"
          : profile.role === "operator"
            ? "/dashboard/operator"
            : "/dashboard/client"
      router.replace(targetDashboard)
    }
  }, [user, profile, isLoading, pathname, router])

  // Mostra uno spinner a schermo intero per evitare sfarfallii durante il controllo iniziale
  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, isLoading, logout }}>
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
