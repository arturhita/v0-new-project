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
  }, [supabase.auth])

  useEffect(() => {
    const manageSession = async (session: Session | null) => {
      setIsLoading(true)
      if (session?.user) {
        // Hard clone the user object immediately to get a clean POJO
        const cleanUser = JSON.parse(JSON.stringify(session.user)) as User
        setUser(cleanUser)

        // Fetch profile based on the user ID
        const { data: rawProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error.message)
          setProfile(null)
        } else if (rawProfile) {
          // Hard clone the profile object immediately
          const cleanProfile = JSON.parse(JSON.stringify(rawProfile)) as Profile

          // Defensive check for services object
          if (!cleanProfile.services) {
            cleanProfile.services = {
              chat: { enabled: false, price_per_minute: 0 },
              call: { enabled: false, price_per_minute: 0 },
              video: { enabled: false, price_per_minute: 0 },
            }
          }
          setProfile(cleanProfile)
        } else {
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      // Mark loading as false only after all async operations are complete
      setIsLoading(false)
    }

    // 1. Check for an initial session on component mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      manageSession(session)
    })

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // When auth state changes, re-run the whole session management logic
      manageSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Separate effect for handling redirection logic for protected routes
  useEffect(() => {
    if (isLoading) {
      return // Don't do anything while session is being checked
    }

    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
    if (!user && isProtectedPage) {
      router.replace("/login")
    }
  }, [user, isLoading, pathname, router])

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
