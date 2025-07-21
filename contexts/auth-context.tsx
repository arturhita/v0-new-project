"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter, usePathname } from "next/navigation"

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
const supabase = createClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }, [router])

  const fetchUserProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null)
      return
    }
    const { data: userProfile, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error fetching profile:", error.message)
      setProfile(null)
    } else {
      setProfile(userProfile)
    }
  }, [])

  useEffect(() => {
    // 1. Determina lo stato di autenticazione iniziale il più velocemente possibile.
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await fetchUserProfile(currentUser)
      // Imposta isLoading a false solo dopo che il controllo iniziale è completo.
      setIsLoading(false)
    }

    getInitialSession()

    // 2. Ascolta i cambiamenti futuri (es. logout da un'altra scheda).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await fetchUserProfile(currentUser)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  useEffect(() => {
    // Questa è la "Guardia di Sicurezza". Si attiva solo quando lo stato è definito.
    if (isLoading) {
      return
    }

    const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    // Se l'utente non è loggato e tenta di accedere a una rotta protetta, lo reindirizza al login.
    if (!user && isProtectedRoute) {
      router.replace("/login")
    }
  }, [isLoading, user, pathname, router])

  // Mostra uno spinner a schermo intero durante il controllo iniziale.
  // Questo previene il "rimbalzo" e lo sfarfallio della UI.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020]">
        <LoadingSpinner />
      </div>
    )
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
