"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

type Profile = {
  id: string
  role: "admin" | "operator" | "client"
  full_name?: string
  avatar_url?: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true)
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("id, role, full_name, avatar_url")
          .eq("id", currentUser.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          setProfile(null)
        } else {
          setProfile(userProfile as Profile)
        }
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  const logout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    router.push("/login")
    setIsLoading(false)
  }

  // Route protection logic
  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isAdminRoute = pathname.startsWith("/admin")
    const isOperatorDashboard = pathname.startsWith("/(platform)/dashboard/operator")
    const isClientDashboard = pathname.startsWith("/(platform)/dashboard/client")

    if (!user && !isAuthPage) {
      router.push("/login")
      return
    }

    if (user && isAuthPage) {
      router.push("/")
      return
    }

    if (user && profile) {
      if (isAdminRoute && profile.role !== "admin") {
        console.warn("Access denied: User is not an admin.")
        router.push("/")
      }
      if (isOperatorDashboard && profile.role !== "operator") {
        console.warn("Access denied: User is not an operator.")
        router.push("/")
      }
      if (isClientDashboard && profile.role !== "client") {
        console.warn("Access denied: User is not a client.")
        router.push("/")
      }
    }
  }, [user, profile, isLoading, pathname, router])

  const value = {
    user,
    profile,
    session,
    isLoading,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {isLoading && <LoadingSpinner />}
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
