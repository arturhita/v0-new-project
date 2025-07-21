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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("id", currentUser.id)
          .maybeSingle()

        if (error) {
          console.error("Errore nel recupero del profilo:", error.message)
          setProfile(null)
        } else {
          setProfile(userProfile)
          // **LOGICA DI REINDIRIZZAMENTO POST-LOGIN**
          // Se l'evento è un login riuscito e abbiamo il profilo, reindirizziamo.
          if (event === "SIGNED_IN" && userProfile) {
            switch (userProfile.role) {
              case "admin":
                router.replace("/admin/dashboard")
                break
              case "operator":
                router.replace("/dashboard/operator")
                break
              case "client":
                router.replace("/dashboard/client")
                break
              default:
                router.replace("/")
                break
            }
          }
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    // Controllo iniziale per utenti già loggati che ricaricano la pagina
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setIsLoading(false)
      }
    }
    getInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    // Guardia di sicurezza per rotte protette
    if (!isLoading && !user) {
      const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
      if (isProtectedRoute) {
        router.replace("/login")
      }
    }
  }, [isLoading, user, pathname, router])

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
