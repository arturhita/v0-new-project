"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"
import { toast } from "sonner"

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

const fetchProfileWithRetry = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  retries = 5,
  delay = 1200, // Slightly increased delay for robustness
): Promise<Profile | null> => {
  for (let i = 0; i < retries; i++) {
    // Using a direct, RLS-protected query.
    // The new SQL script ensures the RLS policy is correct.
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", userId)
      .single()

    if (data) {
      console.log(`Profilo trovato con query diretta (Tentativo ${i + 1}):`, data)
      return data as Profile
    }

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "No rows found"
      console.error(`Errore DB nella query del profilo (Tentativo ${i + 1}):`, error)
      toast.error("Errore di sistema nel recupero del profilo.")
      return null
    }

    // If we are here, it means no row was found (PGRST116). We will retry.
    console.warn(`Profilo per l'utente ${userId} non trovato (Tentativo ${i + 1}). Riprovo...`)
    await new Promise((res) => setTimeout(res, delay))
  }

  console.error(`Profilo per l'utente ${userId} non trovato dopo ${retries} tentativi.`)
  toast.error("Impossibile trovare il profilo utente dopo vari tentativi.")
  return null
}

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true)
      const currentUser = session?.user ?? null

      if (currentUser) {
        const userProfile = await fetchProfileWithRetry(supabase, currentUser.id)

        if (userProfile) {
          setUser(currentUser)
          setProfile(userProfile)
        } else {
          console.error(`Logout forzato: impossibile recuperare il profilo per l'utente ${currentUser.id}.`)
          toast.error("Sessione terminata. Impossibile verificare il profilo utente.")
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
  }, [supabase, router])

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
