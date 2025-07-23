"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

// Define a clean, plain Profile type
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
  services: {
    chat: { enabled: boolean; price_per_minute: number }
    call: { enabled: boolean; price_per_minute: number }
    video: { enabled: boolean; price_per_minute: number }
  }
  [key: string]: any
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
    // No need to push, onAuthStateChange will handle the redirect logic
  }, [supabase.auth])

  useEffect(() => {
    const manageSession = async (session: Session | null) => {
      setIsLoading(true)
      if (session?.user) {
        const { data: rawProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        const cleanUser = JSON.parse(JSON.stringify(session.user))
        setUser(cleanUser)

        if (error) {
          console.error("Auth Provider: Error fetching profile:", error.message)
          setProfile(null)
        } else if (rawProfile) {
          const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

          if (!cleanProfile.services || typeof cleanProfile.services !== "object") {
            cleanProfile.services = {
              chat: { enabled: false, price_per_minute: 0 },
              call: { enabled: false, price_per_minute: 0 },
              video: { enabled: false, price_per_minute: 0 },
            }
          }
          setProfile(cleanProfile as Profile)
        } else {
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      manageSession(session)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      manageSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Centralized redirection logic
  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedPage =
      pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/chat")

    if (!user && isProtectedPage) {
      router.replace("/login")
    }

    if (user && isAuthPage) {
      let destination = "/dashboard/client"
      if (profile?.role === "admin") destination = "/admin"
      if (profile?.role === "operator") destination = "/dashboard/operator"
      router.replace(destination)
    }
  }, [user, profile, isLoading, pathname, router])

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, isLoading, logout }}>
      {isLoading ? (
        <div className="flex h-screen w-full items-center justify-center bg-slate-900">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
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
