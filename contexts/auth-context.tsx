"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: any | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    router.push("/login")
    router.refresh()
  }

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle()

        if (error) {
          console.error("Error fetching profile on initial load:", error.message)
        } else {
          setProfile(profileData)
        }
      }
      setIsLoading(false)
    }

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        setIsLoading(true)
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle()

        if (error) {
          console.error("Error fetching profile on auth change:", error.message)
          setProfile(null)
        } else {
          setProfile(profileData)
        }
        setIsLoading(false)
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  useEffect(() => {
    if (!isLoading && user) {
      const isAuthPage = pathname === "/login" || pathname === "/register"
      if (isAuthPage) {
        const userRole = profile?.role
        if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else if (userRole === "operator") {
          router.push("/(platform)/dashboard/operator")
        } else {
          router.push("/(platform)/dashboard/client")
        }
      }
    }
  }, [isLoading, user, profile, pathname, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return <AuthContext.Provider value={{ user, session, profile, isLoading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
