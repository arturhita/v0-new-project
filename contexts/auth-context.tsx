"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

type Profile = {
  id: string
  role: "client" | "operator" | "admin"
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  logout: () => Promise<void>
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
    const getSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("id", session.user.id)
            .maybeSingle()

          if (error) {
            console.error("Error fetching profile:", error.message)
            setProfile(null)
          } else {
            setProfile(profileData as Profile | null)
          }
        } catch (e: any) {
          console.error("Caught an exception while fetching profile:", e.message)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    }

    getSessionAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("id", session.user.id)
            .maybeSingle()

          if (error) {
            console.error("Error fetching profile on auth change:", error.message)
            setProfile(null)
          } else {
            setProfile(profileData as Profile | null)
          }
        } catch (e: any) {
          console.error("Caught an exception while fetching profile on auth change:", e.message)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

    if (!user && isProtectedRoute) {
      router.replace("/login")
    } else if (user && profile && isAuthPage) {
      switch (profile.role) {
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
      }
    }
  }, [user, profile, isLoading, pathname, router])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/login")
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return <AuthContext.Provider value={{ user, profile, isLoading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
