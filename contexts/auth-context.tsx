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
    router.push("/login")
  }, [supabase.auth, router])

  useEffect(() => {
    const manageSession = async (session: Session | null) => {
      if (session?.user) {
        const { data: rawProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error.message)
          setProfile(null)
          setUser(JSON.parse(JSON.stringify(session.user)))
        } else if (rawProfile) {
          // Definitive Fix: Manually construct a new, clean object.
          // This avoids any issues with Supabase's read-only objects and getters.
          const cleanProfile: Profile = {
            id: rawProfile.id,
            full_name: rawProfile.full_name,
            avatar_url: rawProfile.avatar_url,
            role: rawProfile.role,
            services: rawProfile.services
              ? {
                  chat: { ...rawProfile.services.chat },
                  call: { ...rawProfile.services.call },
                  video: { ...rawProfile.services.video },
                }
              : {
                  chat: { enabled: false, price_per_minute: 0 },
                  call: { enabled: false, price_per_minute: 0 },
                  video: { enabled: false, price_per_minute: 0 },
                },
            // Manually copy any other properties you need from rawProfile here
          }

          setUser(JSON.parse(JSON.stringify(session.user)))
          setProfile(cleanProfile)
        } else {
          // Profile doesn't exist, but user does.
          setUser(JSON.parse(JSON.stringify(session.user)))
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

    // Also check session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      manageSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (isLoading) {
      return
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
