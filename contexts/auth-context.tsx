"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

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
    router.replace("/login") // Reindirizzamento esplicito al logout
  }, [supabase.auth, router])

  useEffect(() => {
    const fetchProfileWithRetry = async (userId: string, retries = 3, delay = 500): Promise<Profile | null> => {
      for (let i = 0; i < retries; i++) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("id", userId)
          .maybeSingle()

        if (error) {
          console.error("Errore DB nel recupero del profilo:", error)
          return null // Errore critico, interrompi
        }
        if (data) {
          return data as Profile // Profilo trovato
        }
        // Profilo non trovato, attendi e riprova
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, delay))
        }
      }
      console.error(`Profilo non trovato per l'utente ${userId} dopo ${retries} tentativi.`)
      return null // Profilo non trovato dopo tutti i tentativi
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true) // Inizia il caricamento ad ogni cambio di stato
      const currentUser = session?.user ?? null

      if (currentUser) {
        const userProfile = await fetchProfileWithRetry(currentUser.id)

        if (userProfile) {
          setUser(currentUser)
          setProfile(userProfile)
        } else {
          // Se il profilo non viene trovato, è un errore. Disconnetti l'utente.
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false) // Fine del caricamento
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isLoading) {
      return // Attendi che il caricamento iniziale sia completato
    }

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!user && isProtectedPage) {
      router.replace("/login")
      return
    }

    if (user && profile && isAuthPage) {
      let destination = "/"
      if (profile.role === "admin") destination = "/admin/dashboard"
      else if (profile.role === "operator") destination = "/dashboard/operator"
      else if (profile.role === "client") destination = "/dashboard/client"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

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
