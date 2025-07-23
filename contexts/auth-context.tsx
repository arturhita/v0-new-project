"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"

interface Profile {
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
  // We add a function to manually trigger a profile refresh after updates
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAndSetProfile = useCallback(
    async (user: User) => {
      const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error.message)
        setProfile(null)
      } else if (rawProfile) {
        // THE DEFINITIVE FIX: Deep clone the raw profile data from Supabase.
        // This creates a plain JavaScript object, stripping all getters and preventing the error.
        const cleanProfile = JSON.parse(JSON.stringify(rawProfile))

        // Defensive check for services object, just in case.
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
    },
    [supabase],
  )

  const manageSession = useCallback(
    async (session: Session | null) => {
      if (session?.user) {
        const cleanUser = JSON.parse(JSON.stringify(session.user))
        setUser(cleanUser)
        await fetchAndSetProfile(cleanUser)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    },
    [fetchAndSetProfile],
  )

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchAndSetProfile(user)
    }
  }, [user, fetchAndSetProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/login")
  }, [supabase.auth, router])

  useEffect(() => {
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
  }, [manageSession, supabase.auth])

  useEffect(() => {
    if (isLoading) return
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
    if (!user && isProtectedPage) {
      router.replace("/login")
    }
  }, [user, isLoading, pathname, router])

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, isLoading, logout, refreshProfile }}>
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
