"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

type Profile = {
  id: string
  full_name: string
  role: "client" | "operator" | "admin"
  avatar_url?: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, avatar_url")
          .eq("id", currentUser.id)
          .maybeSingle() // Usa maybeSingle per non lanciare errori se il profilo non è ancora pronto

        if (error) {
          console.error("Error fetching profile:", error.message)
          setProfile(null)
        } else {
          setProfile(profileData as Profile)
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    // Esegui un controllo iniziale per sessioni esistenti
    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setIsLoading(false)
      }
    }
    checkInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!user && isProtectedRoute) {
      router.replace("/login")
    }

    if (user && profile && isAuthPage) {
      switch (profile.role) {
        case "admin":
          router.replace("/admin")
          break
        case "operator":
          router.replace("/dashboard/operator")
          break
        case "client":
          router.replace("/dashboard/client")
          break
        default:
          router.replace("/")
      }
    }
  }, [user, profile, isLoading, pathname, router])

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return <AuthContext.Provider value={{ user, profile, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
