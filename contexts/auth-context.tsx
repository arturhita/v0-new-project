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
    router.replace("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    const fetchProfileWithRetry = async (retries = 5, delay = 1000): Promise<Profile | null> => {
      for (let i = 0; i < retries; i++) {
        // NUOVA LOGICA: Chiama la funzione RPC sicura 'get_my_profile'
        const { data, error } = await supabase.rpc("get_my_profile").single()

        if (error && error.code !== "PGRST116") {
          // Ignora l'errore "nessuna riga trovata"
          console.error("Errore DB critico nella chiamata a get_my_profile:", error)
          return null
        }

        if (data) {
          console.log(`Profilo trovato tramite RPC al tentativo ${i + 1}.`)
          return data as Profile
        }

        if (i < retries - 1) {
          console.log(`Profilo non ancora disponibile, ritento tra ${delay}ms... (Tentativo ${i + 1}/${retries})`)
          await new Promise((res) => setTimeout(res, delay))
        }
      }
      console.error(`Profilo non trovato dopo ${retries} tentativi.`)
      return null
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true)
      const currentUser = session?.user ?? null

      if (currentUser) {
        // Non passiamo più l'ID utente, la funzione lo sa già
        const userProfile = await fetchProfileWithRetry()

        if (userProfile) {
          setUser(currentUser)
          setProfile(userProfile)
        } else {
          console.error("Logout forzato: impossibile recuperare il profilo dell'utente.")
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isLoading) {
      return
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
